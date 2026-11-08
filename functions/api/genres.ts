import { getAllGenres } from './_lib/db';
import { json, methodNotAllowed } from './_lib/response';
import type { Env } from './_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  const genres = await getAllGenres(context.env.DB);
  return json(genres);
}
