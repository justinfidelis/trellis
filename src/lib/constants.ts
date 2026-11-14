import type { Genre } from '@/data/types';

export const GENRES: Genre[] = [
  // Fiction
  { id: 'FIC000000', name: 'Fiction',                      parent_id: null,        path: 'fiction' },
  { id: 'FIC019000', name: 'Literary Fiction',             parent_id: 'FIC000000', path: 'fiction/literary' },
  { id: 'FIC014110', name: 'Contemporary Fiction',         parent_id: 'FIC000000', path: 'fiction/contemporary' },
  { id: 'FIC014000', name: 'Historical Fiction',           parent_id: 'FIC000000', path: 'fiction/historical' },
  { id: 'FIC009000', name: 'Fantasy',                      parent_id: 'FIC000000', path: 'fiction/fantasy' },
  { id: 'FIC028000', name: 'Science Fiction',              parent_id: 'FIC000000', path: 'fiction/sci-fi' },
  { id: 'FIC042000', name: 'Christian',                    parent_id: 'FIC000000', path: 'fiction/christian' },
  // Non-Fiction
  { id: 'NON000000', name: 'Non Fiction',                  parent_id: null,        path: 'non-fiction' },
  { id: 'HIS000000', name: 'History',                      parent_id: 'NON000000', path: 'non-fiction/history' },
  { id: 'BIO000000', name: 'Biography & Memoir',           parent_id: 'NON000000', path: 'non-fiction/biography' },
  { id: 'COM000000', name: 'Computing',                    parent_id: 'NON000000', path: 'non-fiction/computing' },
  { id: 'SCI000000', name: 'Science & Nature',             parent_id: 'NON000000', path: 'non-fiction/science' },
  { id: 'SCI055000', name: 'Physics',                      parent_id: 'SCI000000', path: 'non-fiction/science/physics' },
  { id: 'SCI013000', name: 'Chemistry',                    parent_id: 'SCI000000', path: 'non-fiction/science/chemistry' },
  { id: 'SCI008000', name: 'Biology',                      parent_id: 'SCI000000', path: 'non-fiction/science/biology' },
  { id: 'MED000000', name: 'Medicine',                     parent_id: 'SCI000000', path: 'non-fiction/science/medicine' },
  { id: 'MAT000000', name: 'Mathematics',                  parent_id: 'SCI000000', path: 'non-fiction/science/mathematics' },
  { id: 'NAT000000', name: 'Environment & Climate Change', parent_id: 'SCI000000', path: 'non-fiction/science/environment' },
  { id: 'SOC000000', name: 'Social Sciences & Politics',   parent_id: 'NON000000', path: 'non-fiction/social-sciences' },
  { id: 'BUS069000', name: 'Economics',                    parent_id: 'SOC000000', path: 'non-fiction/social-sciences/economics' },
  { id: 'POL062000', name: 'Geopolitics',                  parent_id: 'SOC000000', path: 'non-fiction/social-sciences/geopolitics' },
  { id: 'PHI000000', name: 'Philosophy',                   parent_id: 'NON000000', path: 'non-fiction/philosophy' },
  { id: 'PHI019000', name: 'Political Philosophy',         parent_id: 'PHI000000', path: 'non-fiction/philosophy/political' },
  { id: 'PHI004000', name: 'Epistemology',                 parent_id: 'PHI000000', path: 'non-fiction/philosophy/epistemology' },
  { id: 'REL051000', name: 'Philosophy of Religion',       parent_id: 'PHI000000', path: 'non-fiction/philosophy/philosophy-of-religion' },
  { id: 'ARC010000', name: 'Urban Planning',               parent_id: 'NON000000', path: 'non-fiction/urban-planning' },
  { id: 'REL000000', name: 'Religion',                     parent_id: 'NON000000', path: 'non-fiction/religion' },
  { id: 'REL037000', name: 'Islam',                        parent_id: 'REL000000', path: 'non-fiction/religion/islam' },
  { id: 'REL070000', name: 'Christianity',                 parent_id: 'REL000000', path: 'non-fiction/religion/christianity' },
  { id: 'REL067000', name: 'Theology',                     parent_id: 'REL070000', path: 'non-fiction/religion/christianity/theology' },
  { id: 'REL012000', name: 'Christian Living',             parent_id: 'REL070000', path: 'non-fiction/religion/christianity/christian-living' },
];

export function getGenre(id: string): Genre | undefined {
  return GENRES.find((g) => g.id === id);
}

export function getGenreName(id: string): string {
  return GENRES.find((g) => g.id === id)?.name ?? id;
}

export function getGenreByPath(path: string): Genre | undefined {
  return GENRES.find((g) => g.path === path);
}

/** All genre IDs that match genreId or are descendants of it. */
export function subtreeIds(genreId: string): string[] {
  const root = GENRES.find((g) => g.id === genreId);
  if (!root) return [];
  return GENRES
    .filter((g) => g.path === root.path || g.path.startsWith(root.path + '/'))
    .map((g) => g.id);
}

/** Genres in depth-first order for rendering. */
export function flattenGenreTree(): Array<{ genre: Genre; depth: number }> {
  const result: Array<{ genre: Genre; depth: number }> = [];
  function walk(parentId: string | null, depth: number) {
    GENRES.filter((g) => g.parent_id === parentId).forEach((g) => {
      result.push({ genre: g, depth });
      walk(g.id, depth + 1);
    });
  }
  walk(null, 0);
  return result;
}

export const DEFAULT_MAX_REQUESTS = 2;
