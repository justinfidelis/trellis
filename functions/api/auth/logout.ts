import { clearSessionCookie, deleteSession, getSessionCookie } from '../_lib/auth';
import { methodNotAllowed } from '../_lib/response';
import type { Env } from '../_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'POST') return methodNotAllowed();

  const sessionId = getSessionCookie(context.request);
  if (sessionId) {
    await deleteSession(context.env.DB, sessionId);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookie(),
    },
  });
}
