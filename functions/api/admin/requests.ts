import { getAllActiveRequests } from '../_lib/db';
import { json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  const requests = await getAllActiveRequests(context.env.DB);
  return json(requests);
}
