import { getCopiesWithOwner } from '../_lib/db';
import { json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  const copies = await getCopiesWithOwner(context.env.DB, {});
  return json(copies);
}
