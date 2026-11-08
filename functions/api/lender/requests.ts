import { getRequestsByLender } from '../_lib/db';
import { json, methodNotAllowed, unauthorized } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const user = context.data.user;
  if (!user) return unauthorized();

  const requests = await getRequestsByLender(context.env.DB, user.id);
  return json(requests);
}
