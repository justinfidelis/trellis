import { getCopyById, updateCopy } from '../_lib/db';
import { error, forbidden, json, methodNotAllowed, notFound, unauthorized } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  const copyId = context.params.id as string;
  const user = context.data.user;
  if (!user) return unauthorized();

  const copy = await getCopyById(context.env.DB, copyId);
  if (!copy) return notFound();

  // Lenders can only update their own copies; admin can update any
  if (user.role !== 'admin' && copy.owner_id !== user.id) return forbidden();

  if (context.request.method === 'PATCH') {
    const body = await context.request.json() as { status?: string; owner_notes?: string };
    const validStatuses = ['available', 'reserved', 'on_loan', 'unavailable'];
    if (body.status && !validStatuses.includes(body.status)) {
      return error('Invalid status');
    }
    await updateCopy(context.env.DB, copyId, { status: body.status, owner_notes: body.owner_notes });
    return json({ ok: true });
  }

  return methodNotAllowed();
}
