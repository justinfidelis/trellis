import { mockBooks } from '@/data/mock';

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

// Mock state: tracks when each ISBN will be "ready" after a batch submit
const MOCK_STAGGER_MS = 800;
let mockReadyTimes: Record<string, number> = {};

export async function submitISBNList(isbns: string[]): Promise<void> {
  // TODO(backend): POST /api/books/search-batch { isbns }
  // Backend begins staggered search and caches results as they arrive.
  const now = Date.now();
  mockReadyTimes = Object.fromEntries(
    isbns.map((isbn, i) => [isbn, now + (i + 1) * MOCK_STAGGER_MS])
  );
  await new Promise<void>((r) => setTimeout(r, 100));
}

export async function getBookSearchResult(isbn: string): Promise<GetBookResult> {
  // TODO(backend): GET /api/books/search/${isbn}
  // Returns 200 { status: 'found', data: {...} } | 200 { status: 'not_found' } | 202 { status: 'pending' }
  await new Promise<void>((r) => setTimeout(r, 120));
  const readyAt = mockReadyTimes[isbn];
  if (!readyAt || Date.now() < readyAt) {
    return { status: 'pending' };
  }
  const book = mockBooks.find((b) => b.isbn === isbn);
  if (book) {
    return {
      status: 'found',
      data: {
        title: book.title,
        author: book.author,
        cover_url: book.cover_url ?? undefined,
        description: book.description ?? undefined,
      },
    };
  }
  return { status: 'not_found' };
}

export async function uploadCoverImage(file: File): Promise<string> {
  // TODO(backend): POST /api/uploads/cover (multipart/form-data)
  // Returns { url: "https://trellis-covers.s3.amazonaws.com/..." }
  await new Promise<void>((r) => setTimeout(r, 600));
  return URL.createObjectURL(file);
}

export async function saveBookCopy(_draft: {
  isbn: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  owner_note: string;
  status: 'available' | 'unavailable';
}): Promise<void> {
  // TODO(backend): POST /api/copies { book: { isbn, title, author, description, cover_url }, copy: { owner_notes, status } }
  await new Promise<void>((r) => setTimeout(r, 150));
}
