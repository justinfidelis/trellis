import { getGoogleAuthUrl } from '../_lib/auth';
import { error, methodNotAllowed } from '../_lib/response';
import type { Env } from '../_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const { GOOGLE_CLIENT_ID } = context.env;
  if (!GOOGLE_CLIENT_ID) return error('OAuth not configured', 500);

  const origin = new URL(context.request.url).origin;
  const redirectUri = `${origin}/api/auth/callback`;
  const state = crypto.randomUUID();

  const authUrl = getGoogleAuthUrl(GOOGLE_CLIENT_ID, redirectUri, state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl,
      // Short-lived cookie — just needs to survive the round-trip to Google
      'Set-Cookie': `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=600`,
    },
  });
}
