import { createSession, exchangeGoogleCode, setSessionCookie } from '../_lib/auth';
import { createUser, getUserByEmail } from '../_lib/db';
import { error, methodNotAllowed } from '../_lib/response';
import type { Env } from '../_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const errorParam = url.searchParams.get('error');

  if (errorParam || !code) {
    return Response.redirect(new URL('/login?error=access_denied', url).toString(), 302);
  }

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = context.env;
  const redirectUri = `${url.origin}/api/auth/callback`;

  const profile = await exchangeGoogleCode(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
  if (!profile) {
    return Response.redirect(new URL('/login?error=oauth_failed', url).toString(), 302);
  }

  const user = await getUserByEmail(context.env.DB, profile.email);
  if (!user) {
    // Email not in the approved lenders list
    return Response.redirect(new URL('/login?error=not_authorised', url).toString(), 302);
  }

  // First sign-in: backfill name from Google if empty
  const sessionId = await createSession(context.env.DB, user.id);
  const isSecure = url.protocol === 'https:';

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/lender/books',
      'Set-Cookie': setSessionCookie(sessionId, isSecure),
    },
  });
}
