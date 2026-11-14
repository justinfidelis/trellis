import type { CopyWithBook } from '@/hooks/useBooks';
import { BookCard } from './BookCard';

interface BookGridProps {
  books: CopyWithBook[];
  isPending?: boolean;
}

export function BookGrid({ books, isPending }: BookGridProps) {
  if (isPending) {
    return (
      <p className="text-muted-foreground text-sm py-12 text-center">Loading…</p>
    );
  }

  if (books.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-12 text-center">No books found.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((item) => (
        <BookCard key={item.id} item={item} />
      ))}
    </div>
  );
}
