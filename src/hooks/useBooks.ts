import { useQuery } from '@tanstack/react-query';
import { GENRES, subtreeIds } from '@/lib/constants';
import type { Copy, Genre } from '@/data/types';

// Browse/detail rows: a copy plus its owner's display name.
export type CopyWithBook = Copy & { owner_name: string };

export function useLenderBooks() {
  return useQuery({
    queryKey: ['lender-books'],
    queryFn: async (): Promise<Copy[]> => {
      const res = await fetch('/api/lender/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      return res.json() as Promise<Copy[]>;
    },
  });
}

async function fetchBooks(query: string, genrePath: string, availableOnly: boolean): Promise<CopyWithBook[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (genrePath) params.set('genre', genrePath);
  if (availableOnly) params.set('available', 'true');
  const res = await fetch(`/api/books?${params}`);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export function useBooks(query: string, genreId: string, availableOnly = false) {
  const genre = genreId ? GENRES.find((g) => g.id === genreId) : null;
  const genrePath = genre?.path ?? '';
  return useQuery({
    queryKey: ['books', query, genrePath, availableOnly],
    queryFn: () => fetchBooks(query, genrePath, availableOnly),
  });
}

export function useCopyWithBook(copyId: string) {
  return useQuery({
    queryKey: ['copy', copyId],
    queryFn: async (): Promise<CopyWithBook | null> => {
      const res = await fetch(`/api/books/${copyId}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch copy');
      return res.json();
    },
    enabled: !!copyId,
  });
}

export function useGenres(): Genre[] {
  return GENRES;
}

export function useCopiesWithBooks(copyIds: string[]) {
  return useQuery({
    queryKey: ['copies', copyIds],
    queryFn: async (): Promise<CopyWithBook[]> => {
      const results = await Promise.all(
        copyIds.map(async (id) => {
          const res = await fetch(`/api/books/${id}`);
          if (!res.ok) return null;
          return res.json() as Promise<CopyWithBook>;
        })
      );
      return results.filter((r): r is CopyWithBook => r !== null);
    },
    enabled: copyIds.length > 0,
  });
}

// Kept for subtree filtering in GenreNav
export { subtreeIds };
