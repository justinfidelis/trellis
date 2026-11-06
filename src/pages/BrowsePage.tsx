import { Fragment } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BookGrid } from '@/components/books/BookGrid';
import { PageShell } from '@/components/layout/PageShell';
import { useBooks } from '@/hooks/useBooks';
import { GENRES, getGenreByPath } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

function Breadcrumbs({ genrePath }: { genrePath: string }) {
  if (!genrePath) return null;

  const segments = genrePath.split('/');
  const crumbs: { name: string; path: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const partialPath = segments.slice(0, i + 1).join('/');
    const genre = GENRES.find((g) => g.path === partialPath);
    if (genre) crumbs.push({ name: genre.name, path: partialPath });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors">
        All Books
      </Link>
      {crumbs.map((crumb, i) => (
        <Fragment key={crumb.path}>
          <ChevronRight className="h-3 w-3" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground">{crumb.name}</span>
          ) : (
            <Link to={`/?genre=${crumb.path}`} className="hover:text-foreground transition-colors">
              {crumb.name}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const genrePath = searchParams.get('genre') ?? '';
  const query = searchParams.get('q') ?? '';
  const availableOnly = searchParams.get('available') === '1';

  const currentGenre = genrePath ? getGenreByPath(genrePath) : null;
  const genreId = currentGenre?.id ?? '';
  const books = useBooks(query, genreId, availableOnly);

  const heading = currentGenre?.name ?? 'All Books';

  const toggleAvailable = () => {
    const next = new URLSearchParams(searchParams);
    if (availableOnly) next.delete('available'); else next.set('available', '1');
    navigate(`/?${next.toString()}`);
  };

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
            <div className="flex items-center gap-2">
              <Checkbox
                id="available-only"
                checked={availableOnly}
                onCheckedChange={toggleAvailable}
                className="data-[state=checked]:bg-lime-600 data-[state=checked]:border-lime-600"
              />
              <Label htmlFor="available-only" className="text-sm cursor-pointer">Available only</Label>
            </div>
          </div>
          <Breadcrumbs genrePath={genrePath} />
        </div>
        <BookGrid books={books} />
      </div>
    </PageShell>
  );
}
