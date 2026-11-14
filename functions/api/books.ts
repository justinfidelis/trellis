import { getCopiesWithOwner } from './_lib/db';
import { json, methodNotAllowed } from './_lib/response';
import type { Env } from './_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const url = new URL(context.request.url);
  const query = url.searchParams.get('q') ?? '';
  const genrePath = url.searchParams.get('genre') ?? '';
  const availableOnly = url.searchParams.get('available') === 'true';

  const copies = await getCopiesWithOwner(context.env.DB, { query, genrePath, availableOnly });
  return json(copies);
}
