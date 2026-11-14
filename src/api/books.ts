export type BookSearchData = {
  title: string;
  author: string;
  cover_url?: string;
  description?: string;
};

export type GetBookResult =
  | { status: 'found'; data: BookSearchData }
  | { status: 'not_found' }
  | { status: 'pending' };

export async function submitISBNList(isbns: string[]): Promise<void> {
  await fetch('/api/books/search-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isbns }),
  });
}

export async function getBookSearchResult(isbn: string): Promise<GetBookResult> {
  const res = await fetch(`/api/books/search/${isbn}`);
  if (!res.ok) return { status: 'not_found' };
  return res.json() as Promise<GetBookResult>;
}

export async function uploadCoverImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/uploads/cover', { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'Failed to upload image');
  }
  const data = await res.json() as { url: string };
  return data.url;
}

export async function saveBookCopy(draft: {
  isbn: string;
  title: string;
  author: string;
  genre_id: string;
  description: string;
  cover_url: string;
  owner_note: string;
  status: 'available' | 'unavailable';
}): Promise<void> {
  const res = await fetch('/api/lender/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isbn: draft.isbn || undefined,
      title: draft.title,
      author: draft.author,
      genre_id: draft.genre_id,
      description: draft.description || undefined,
      cover_url: draft.cover_url || undefined,
      owner_notes: draft.owner_note || undefined,
      status: draft.status,
    }),
  });
  if (!res.ok) {
    const body = await res.json() as { error?: string };
    throw new Error(body.error ?? 'Failed to save book');
  }
}
