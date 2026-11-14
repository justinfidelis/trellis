import { getCachedBook } from '../../_lib/db';
import { json, methodNotAllowed } from '../../_lib/response';
import type { Env } from '../../_lib/types';

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'GET') return methodNotAllowed();

  const isbn = context.params.isbn as string;
  const book = await getCachedBook(context.env.DB, isbn);

  if (!book) return json({ status: 'pending' });

  return json({
    status: 'found',
    data: { title: book.title, author: book.author, cover_url: book.cover_url ?? '' },
  });
}
