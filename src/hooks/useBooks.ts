import { useMemo } from 'react';
import { mockBooks, mockCopies, mockUsers } from '@/data/mock';
import { GENRES, subtreeIds } from '@/lib/constants';
import type { Book, Copy } from '@/data/types';

export type CopyWithBook = Omit<Book, 'id' | 'created_at'> & Copy & { owner_name: string };

function ownerName(ownerId: string): string {
  return mockUsers.find((u) => u.id === ownerId)?.name ?? 'Unknown';
}

export function useBooks(query: string, genreId: string) {
  return useMemo<CopyWithBook[]>(() => {
    const q = query.toLowerCase();
    const matchIds = genreId ? new Set(subtreeIds(genreId)) : null;

    return mockCopies.flatMap((copy) => {
      if (copy.status === 'unavailable') return [];
      const book = mockBooks.find((b) => b.id === copy.book_id);
      if (!book) return [];
      const matchesQuery =
        !q || book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q);
      const matchesGenre = !matchIds || matchIds.has(book.genre_id);
      if (!matchesQuery || !matchesGenre) return [];
      return [{ ...book, ...copy, owner_name: ownerName(copy.owner_id) }];
    });
  }, [query, genreId]);
}

export function useCopyWithBook(copyId: string): CopyWithBook | undefined {
  return useMemo(() => {
    const copy = mockCopies.find((c) => c.id === copyId);
    if (!copy) return undefined;
    const book = mockBooks.find((b) => b.id === copy.book_id);
    if (!book) return undefined;
    return { ...book, ...copy, owner_name: ownerName(copy.owner_id) };
  }, [copyId]);
}

export function useGenres() {
  return GENRES;
}

export function useCopiesWithBooks(copyIds: string[]): CopyWithBook[] {
  return useMemo(() => {
    return copyIds.flatMap((id) => {
      const copy = mockCopies.find((c) => c.id === id);
      if (!copy) return [];
      const book = mockBooks.find((b) => b.id === copy.book_id);
      if (!book) return [];
      return [{ ...book, ...copy, owner_name: ownerName(copy.owner_id) }];
    });
  }, [copyIds]);
}
