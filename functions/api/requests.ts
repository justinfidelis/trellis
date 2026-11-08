import {
  createRequest, getActiveRequestCountForBorrower, getCopyWithBook,
  getRequestsByLender, getSetting, getUserById, isValidPasscode,
} from './_lib/db';
import { error, json, methodNotAllowed, unauthorized } from './_lib/response';
import { requestNotificationText, sendTelegramMessage } from './_lib/telegram';
import type { AppContext } from './_lib/types';

export async function onRequest(context: AppContext) {
  const user = context.data.user;

  // GET — lender/admin fetch their own requests
  if (context.request.method === 'GET') {
    if (!user) return unauthorized();
    const requests = await getRequestsByLender(context.env.DB, user.id);
    return json(requests);
  }

  // POST — public, passcode-gated
  if (context.request.method === 'POST') {
    const body = await context.request.json() as {
      copy_id: string;
      passcode: string;
      borrower_name: string;
      borrower_tele: string;
    };

    if (!body.copy_id || !body.passcode || !body.borrower_name || !body.borrower_tele) {
      return error('Missing required fields');
    }

    const valid = await isValidPasscode(context.env.DB, body.passcode);
    if (!valid) return error('Invalid passcode', 403);

    const copy = await getCopyWithBook(context.env.DB, body.copy_id) as { status: string; owner_id: string; id: string; book_id: string; title: string } | null;
    if (!copy) return error('Copy not found', 404);
    if (copy.status === 'unavailable') return error('This book is not available for requests', 400);

    const maxStr = await getSetting(context.env.DB, 'max_active_requests');
    const max = parseInt(maxStr ?? '2', 10);
    const activeCount = await getActiveRequestCountForBorrower(
      context.env.DB, body.borrower_name, body.borrower_tele
    );
    if (activeCount >= max) {
      return error(`You have reached the limit of ${max} active requests`, 400);
    }

    const requestId = await createRequest(context.env.DB, {
      book_id: copy.book_id,
      lender_id: copy.owner_id,
      borrower_name: body.borrower_name,
      borrower_tele: body.borrower_tele,
    });

    // Notify lender — best-effort, don't await in the critical path
    const lender = await getUserById(context.env.DB, copy.owner_id);
    if (lender?.tele_handle) {
      context.waitUntil(
        sendTelegramMessage(
          context.env.BOT_TOKEN,
          lender.tele_handle,
          requestNotificationText({
            bookTitle: copy.title,
            borrowerName: body.borrower_name,
            borrowerTele: body.borrower_tele,
            isQueue: copy.status !== 'available',
          })
        )
      );
    }

    return json({ id: requestId }, 201);
  }

  return methodNotAllowed();
}
