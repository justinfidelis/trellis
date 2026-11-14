import { methodNotAllowed, notFound } from '../_lib/response';
import type { Env } from '../_lib/types';

// Public: serves a cover image stored in R2. Covers are non-sensitive and
// viewed by borrowers, so no auth gate here.
export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const key = context.params.key as string;
  const obj = await context.env.R2.get(key);
  if (!obj) return notFound();

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return new Response(obj.body, { headers });
}
