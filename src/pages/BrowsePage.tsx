import { Fragment } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { BookGrid } from '@/components/books/BookGrid';
import { PageShell } from '@/components/layout/PageShell';
import { useBooks } from '@/hooks/useBooks';
import { GENRES, getGenreByPath } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const DEFAULT_PER_PAGE = 25;

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const genrePath = searchParams.get('genre') ?? '';
  const query = searchParams.get('q') ?? '';
  const availableOnly = searchParams.get('available') === '1';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const perPage = parseInt(searchParams.get('per_page') ?? String(DEFAULT_PER_PAGE), 10);
  const validPerPage = PAGE_SIZE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PER_PAGE;

  const currentGenre = genrePath ? getGenreByPath(genrePath) : null;
  const genreId = currentGenre?.id ?? '';
  const allBooks = useBooks(query, genreId, availableOnly);

  const totalPages = Math.max(1, Math.ceil(allBooks.length / validPerPage));
  const currentPage = Math.min(page, totalPages);
  const books = allBooks.slice((currentPage - 1) * validPerPage, currentPage * validPerPage);

  const heading = currentGenre?.name ?? 'All Books';

  const nav = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) next.delete(k); else next.set(k, v);
    }
    navigate(`/?${next.toString()}`);
  };

  const toggleAvailable = () =>
    nav({ available: availableOnly ? null : '1', page: null });

  const goToPage = (p: number) =>
    nav({ page: p === 1 ? null : String(p) });

  const changePerPage = (size: number) =>
    nav({ per_page: size === DEFAULT_PER_PAGE ? null : String(size), page: null });

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

        {allBooks.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Per page</span>
              <Select value={String(validPerPage)} onValueChange={(v) => changePerPage(Number(v))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs">
                {(currentPage - 1) * validPerPage + 1}–{Math.min(currentPage * validPerPage, allBooks.length)} of {allBooks.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm px-3">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
