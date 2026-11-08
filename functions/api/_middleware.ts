import { getSessionCookie, getSessionUser } from './_lib/auth';
import type { Env } from './_lib/types';

export async function onRequest(context: EventContext<Env, string, { user?: { id: string; email: string; name: string; tele_handle: string; role: string } }>) {
  const sessionId = getSessionCookie(context.request);
  if (sessionId) {
    const user = await getSessionUser(context.env.DB, sessionId);
    if (user) {
      context.data.user = user;
    }
  }
  return context.next();
}
