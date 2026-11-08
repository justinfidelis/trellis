import { forbidden, unauthorized } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  const user = context.data.user;
  if (!user) return unauthorized();
  if (user.role !== 'admin') return forbidden();
  return context.next();
}
