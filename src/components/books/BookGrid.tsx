import type { BookWithStatus } from '@/hooks/useBooks';
import { BookCard } from '@/components/books/BookCard';

interface BookGridProps {
  books: BookWithStatus[];
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-12 text-center">No books found.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {books.map((item) => (
        <BookCard key={item.book.id} item={item} />
      ))}
    </div>
  );
}
