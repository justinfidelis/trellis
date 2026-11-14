import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GENRES } from '@/lib/constants';
import type { Genre } from '@/data/types';

interface DropdownProps {
  genres: Genre[];
  onNavigate: (path: string) => void;
}

function GenreDropdown({ genres, onNavigate }: DropdownProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="py-1">
      {genres.map((genre) => {
        const children = GENRES.filter((g) => g.parent_id === genre.id);
        const hasChildren = children.length > 0;

        return (
          <div
            key={genre.id}
            className="relative"
            onMouseEnter={() => hasChildren ? setOpenId(genre.id) : setOpenId(null)}
            onMouseLeave={() => setOpenId(null)}
          >
            <button
              onClick={() => onNavigate(genre.path)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-lime-50 text-left whitespace-nowrap"
            >
              <span>{genre.name}</span>
              {hasChildren && <ChevronRight className="h-3 w-3 ml-6 text-muted-foreground" />}
            </button>

            {hasChildren && openId === genre.id && (
              <div className="absolute left-full top-0 z-50 bg-white border rounded-md shadow-lg min-w-40">
                <GenreDropdown genres={children} onNavigate={onNavigate} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function GenreNav() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPath = searchParams.get('genre') ?? '';

  const [openId, setOpenId] = useState<string | null>(null);

  const goToGenre = (genrePath: string) => {
    const next = new URLSearchParams(searchParams);
    if (genrePath) next.set('genre', genrePath); else next.delete('genre');
    next.delete('page');
    navigate(`/?${next.toString()}`);
  };

  const topLevel = GENRES.filter((g) => g.parent_id === null);

  return (
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-stretch">
          {topLevel.map((genre) => {
            const children = GENRES.filter((g) => g.parent_id === genre.id);
            const isActive =
              currentPath === genre.path || currentPath.startsWith(genre.path + '/');

            return (
              <div
                key={genre.id}
                className="relative"
                onMouseEnter={() => setOpenId(genre.id)}
                onMouseLeave={() => setOpenId(null)}
              >
                <button
                  onClick={() => goToGenre(genre.path)}
                  className={`flex items-center gap-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-lime-600 text-lime-700'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40'
                  }`}
                >
                  {genre.name}
                  {children.length > 0 && (
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  )}
                </button>

                {children.length > 0 && openId === genre.id && (
                  <div className="absolute top-full left-0 z-50 bg-white border rounded-md shadow-lg min-w-44">
                    <GenreDropdown genres={children} onNavigate={goToGenre} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
