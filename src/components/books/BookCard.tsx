import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CoverImage } from '@/components/books/CoverImage';
import { StatusBadge } from '@/components/requests/StatusBadge';
import type { BookWithStatus } from '@/hooks/useBooks';

interface BookCardProps {
  item: BookWithStatus;
}

export function BookCard({ item }: BookCardProps) {
  const { book, bestStatus } = item;
  const isAvailable = bestStatus === 'available';

  return (
    <Link to={`/book/${book.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow group-hover:shadow-md h-full">
        <div className="aspect-[3/2] relative overflow-hidden">
          <CoverImage src={book.cover_url} title={book.title} />
        </div>
        <CardContent className="p-3 space-y-1.5">
          <div className="space-y-0.5">
            <p className={`font-medium text-sm leading-snug line-clamp-2 ${!isAvailable ? 'text-muted-foreground' : ''}`}>
              {book.title}
            </p>
            <p className="text-muted-foreground text-xs">{book.author}</p>
          </div>
          <StatusBadge status={bestStatus} />
        </CardContent>
      </Card>
    </Link>
  );
}
