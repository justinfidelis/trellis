import { getBooksWithCopies } from '../_lib/db';
import { json, methodNotAllowed } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  if (context.request.method !== 'GET') return methodNotAllowed();
  const books = await getBooksWithCopies(context.env.DB, {});
  return json(books);
}
