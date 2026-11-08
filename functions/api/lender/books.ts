import { createBook, createCopy, getCopiesByOwner } from '../_lib/db';
import { error, json, methodNotAllowed, unauthorized } from '../_lib/response';
import type { AppContext } from '../_lib/types';

export async function onRequest(context: AppContext) {
  const user = context.data.user;
  if (!user) return unauthorized();

  // GET — list own books + copies
  if (context.request.method === 'GET') {
    const copies = await getCopiesByOwner(context.env.DB, user.id);
    return json(copies);
  }

  // POST — add a new book + copy
  if (context.request.method === 'POST') {
    const body = await context.request.json() as {
      isbn?: string;
      title: string;
      author: string;
      genre_id: string;
      description?: string;
      cover_url?: string;
      owner_notes?: string;
    };

    if (!body.title || !body.author || !body.genre_id) {
      return error('title, author and genre_id are required');
    }

    const bookId = await createBook(context.env.DB, {
      isbn: body.isbn,
      title: body.title,
      author: body.author,
      genre_id: body.genre_id,
      description: body.description,
      cover_url: body.cover_url,
    });

    const copyId = await createCopy(context.env.DB, {
      book_id: bookId,
      owner_id: user.id,
      owner_notes: body.owner_notes,
    });

    return json({ book_id: bookId, copy_id: copyId }, 201);
  }

  return methodNotAllowed();
}
