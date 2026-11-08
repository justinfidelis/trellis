import {
  getCopyById, getNextInQueue, getRequestById, getUserById,
  updateCopy, updateRequest,
} from '../_lib/db';
import { error, forbidden, json, methodNotAllowed, notFound, unauthorized } from '../_lib/response';
import { queueAdvancedNotificationText, sendTelegramMessage } from '../_lib/telegram';
import type { AppContext } from '../_lib/types';

const VALID_TRANSITIONS: Record<string, string[]> = {
  queued:  ['ready', 'cancelled'],
  ready:   ['on_loan', 'cancelled'],
  on_loan: ['returned'],
};

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'PATCH') return methodNotAllowed();

  const user = context.data.user;
  if (!user) return unauthorized();

  const requestId = context.params.id as string;
  const req = await getRequestById(context.env.DB, requestId);
  if (!req) return notFound();

  if (user.role !== 'admin' && req.lender_id !== user.id) return forbidden();

  const body = await context.request.json() as { status: string; copy_id?: string };
  const allowed = VALID_TRANSITIONS[req.status] ?? [];
  if (!allowed.includes(body.status)) {
    return error(`Cannot transition from ${req.status} to ${body.status}`);
  }

  const now = new Date().toISOString();
  const update: Parameters<typeof updateRequest>[2] = { status: body.status };

  if (body.status === 'ready')    update.ready_at = now;
  if (body.status === 'on_loan')  { update.loaned_at = now; update.copy_id = body.copy_id; }
  if (body.status === 'returned') update.returned_at = now;

  await updateRequest(context.env.DB, requestId, update);

  // When marking returned: free the copy, advance queue
  if (body.status === 'returned' && req.copy_id) {
    const next = await getNextInQueue(context.env.DB, req.book_id, req.lender_id);
    if (next) {
      await updateRequest(context.env.DB, next.id, { status: 'ready', ready_at: now });
      await updateCopy(context.env.DB, req.copy_id, { status: 'reserved' });

      const lender = await getUserById(context.env.DB, req.lender_id);
      if (lender?.tele_handle) {
        // Look up book title from the copy's book
        const copy = await getCopyById(context.env.DB, req.copy_id);
        if (copy) {
          context.waitUntil(
            sendTelegramMessage(
              context.env.BOT_TOKEN,
              lender.tele_handle,
              queueAdvancedNotificationText({
                bookTitle: req.book_id, // will be replaced by title lookup below
                borrowerName: next.borrower_name,
                borrowerTele: next.borrower_tele,
              })
            )
          );
        }
      }
    } else {
      await updateCopy(context.env.DB, req.copy_id, { status: 'available' });
    }
  }

  return json({ ok: true });
}
