import { useMemo } from 'react';
import { mockBooks, mockCopies } from '@/data/mock';
import { GENRES, subtreeIds } from '@/lib/constants';
import type { Book, CopyStatus } from '@/data/types';

export interface BookWithStatus {
  book: Book;
  bestStatus: CopyStatus;
}

function bestCopyStatus(bookId: string): CopyStatus {
  const copies = mockCopies.filter((c) => c.book_id === bookId);
  if (copies.length === 0) return 'unavailable';
  const order: CopyStatus[] = ['available', 'reserved', 'on_loan', 'unavailable'];
  for (const status of order) {
    if (copies.some((c) => c.status === status)) return status;
  }
  return 'unavailable';
}

export function useBooks(query: string, genreId: string) {
  const books = useMemo<BookWithStatus[]>(() => {
    const q = query.toLowerCase();
    const matchIds = genreId ? new Set(subtreeIds(genreId)) : null;
    return mockBooks
      .filter((b) => {
        const matchesQuery =
          !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
        const matchesGenre = !matchIds || matchIds.has(b.genre_id);
        return matchesQuery && matchesGenre;
      })
      .map((book) => ({ book, bestStatus: bestCopyStatus(book.id) }));
  }, [query, genreId]);

  return books;
}

export function useGenres() {
  return GENRES;
}

export function useBook(bookId: string): BookWithStatus | undefined {
  return useMemo(() => {
    const book = mockBooks.find((b) => b.id === bookId);
    if (!book) return undefined;
    return { book, bestStatus: bestCopyStatus(book.id) };
  }, [bookId]);
}

export function useBookCopies(bookId: string) {
  return mockCopies.filter((c) => c.book_id === bookId);
}
