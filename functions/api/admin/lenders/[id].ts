import { deleteUser, getUserById } from '../../_lib/db';
import { forbidden, json, methodNotAllowed, notFound } from '../../_lib/response';
import type { AppContext } from '../../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'DELETE') return methodNotAllowed();

  const id = context.params.id as string;
  const target = await getUserById(context.env.DB, id);
  if (!target) return notFound();
  if (target.role === 'admin') return forbidden();

  await deleteUser(context.env.DB, id);
  return json({ ok: true });
}
