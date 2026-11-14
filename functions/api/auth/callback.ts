import { createSession, exchangeGoogleCode, setSessionCookie } from '../_lib/auth';
import { getUserByEmail } from '../_lib/db';
import { methodNotAllowed } from '../_lib/response';
import type { Env } from '../_lib/types';

function getOauthStateCookie(request: Request): string | null {
  const cookie = request.headers.get('Cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/);
  return match ? match[1] : null;
}

const clearStateCookie = 'oauth_state=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam || !code) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login?error=access_denied', 'Set-Cookie': clearStateCookie },
    });
  }

  // Verify CSRF state
  const storedState = getOauthStateCookie(context.request);
  if (!storedState || storedState !== returnedState) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login?error=invalid_state', 'Set-Cookie': clearStateCookie },
    });
  }

  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = context.env;
  const redirectUri = `${url.origin}/api/auth/callback`;

  const profile = await exchangeGoogleCode(code, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);
  if (!profile) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login?error=oauth_failed', 'Set-Cookie': clearStateCookie },
    });
  }

  const user = await getUserByEmail(context.env.DB, profile.email);
  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/login?error=not_authorised', 'Set-Cookie': clearStateCookie },
    });
  }

  const sessionId = await createSession(context.env.DB, user.id);
  const isSecure = url.protocol === 'https:';

  const headers = new Headers({ Location: '/dashboard/books' });
  headers.append('Set-Cookie', setSessionCookie(sessionId, isSecure));
  headers.append('Set-Cookie', clearStateCookie);

  return new Response(null, { status: 302, headers });
}
