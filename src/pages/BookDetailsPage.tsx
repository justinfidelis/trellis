import { Fragment } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ShoppingBasket } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { CoverImage } from '@/components/books/CoverImage';
import { StatusBadge } from '@/components/requests/StatusBadge';
import { Button } from '@/components/ui/button';
import { useCopyWithBook } from '@/hooks/useBooks';
import { mockUsers } from '@/data/mock';
import { GENRES } from '@/lib/constants';

function BookBreadcrumbs({ genre_id, title }: { genre_id: string; title: string }) {
  const genre = GENRES.find((g) => g.id === genre_id);
  const segments = genre ? genre.path.split('/') : [];
  const crumbs: { name: string; path: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const partialPath = segments.slice(0, i + 1).join('/');
    const g = GENRES.find((g) => g.path === partialPath);
    if (g) crumbs.push({ name: g.name, path: partialPath });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">
        All Books
      </Link>
      {crumbs.map((crumb) => (
        <Fragment key={crumb.path}>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/?genre=${crumb.path}`} className="hover:text-foreground transition-colors">
            {crumb.name}
          </Link>
        </Fragment>
      ))}
      <ChevronRight className="h-3 w-3" />
      <span className="text-foreground truncate max-w-xs">{title}</span>
    </nav>
  );
}

export function BookDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const item = useCopyWithBook(id ?? '');

  if (!item) {
    return (
      <PageShell>
        <p className="text-muted-foreground">Book not found.</p>
      </PageShell>
    );
  }

  const owner = mockUsers.find((u) => u.id === item.owner_id);
  const genre = GENRES.find((g) => g.id === item.genre_id);
  const isAvailable = item.status === 'available';

  return (
    <PageShell>
      <div className="space-y-6">
        <BookBreadcrumbs genre_id={item.genre_id} title={item.title} />

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="w-44 shrink-0 mx-auto sm:mx-0 aspect-[2/3] rounded-lg overflow-hidden bg-muted">
            <CoverImage src={item.cover_url} title={item.title} />
          </div>

          <div className="space-y-4 min-w-0">
            <div className="space-y-0.5">
              <h1 className="text-2xl font-semibold tracking-tight">{item.title}</h1>
              <p className="text-muted-foreground">{item.author}</p>
            </div>

            {item.description && (
              <p className="text-sm leading-relaxed text-foreground/80">{item.description}</p>
            )}

            {item.owner_notes && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Owner's note
                </p>
                <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">
                  {item.owner_notes}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 shrink-0">Owned by</span>
                <span>{owner?.name ?? '—'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-20 shrink-0">Status</span>
                <StatusBadge status={item.status} />
              </div>
            </div>

            {genre && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                  {genre.name}
                </span>
              </div>
            )}

            <Button size="sm" variant={isAvailable ? 'default' : 'secondary'}>
              <ShoppingBasket />
              {isAvailable ? 'Add to basket' : 'Reserve'}
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
