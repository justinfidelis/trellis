import { getCopyWithOwner } from '../_lib/db';
import { json, methodNotAllowed, notFound } from '../_lib/response';
import type { Env } from '../_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const copyId = context.params.id as string;
  const copy = await getCopyWithOwner(context.env.DB, copyId);
  if (!copy) return notFound();
  return json(copy);
}
