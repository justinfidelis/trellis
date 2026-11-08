import { json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  return json(context.data.user ?? null);
}
