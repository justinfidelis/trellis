import { deleteUser } from '../../_lib/db';
import { json, methodNotAllowed } from '../../_lib/response';
import type { AppContext } from '../../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'DELETE') return methodNotAllowed();
  await deleteUser(context.env.DB, context.params.id as string);
  return json({ ok: true });
}
