import { cacheBook, getUncachedISBNs } from '../_lib/db';
import { error, json, methodNotAllowed } from '../_lib/response';
import type { Env } from '../_lib/types';

const OL_BOOKS_API = 'https://openlibrary.org/api/books';
const OL_COVERS = 'https://covers.openlibrary.org/b/isbn';
const USER_AGENT = 'Trellis/1.0 (trellis-library-app)';
const RATE_LIMIT_DELAY_MS = 1100; // 1 req/s with a small buffer

type OLBooksEntry = {
  title?: string;
  authors?: Array<{ name: string }>;
  cover?: { small?: string; medium?: string; large?: string };
};

async function fetchOpenLibraryBook(
  isbn: string,
): Promise<{ title: string; author: string; cover_url: string } | null> {
  const bibKey = `ISBN:${isbn}`;
  try {
    const res = await fetch(
      `${OL_BOOKS_API}?bibkeys=${encodeURIComponent(bibKey)}&format=json&jscmd=data`,
      { headers: { 'User-Agent': USER_AGENT } },
    );
    if (!res.ok) return null;

    const data = await res.json() as Record<string, OLBooksEntry>;
    const entry = data[bibKey];
    if (!entry?.title) return null;

    // Open Library sometimes lists the same person as multiple author records
    // (distinct IDs, identical name) — dedupe by name so we don't store "X, X".
    const seen = new Set<string>();
    const author = (entry.authors ?? [])
      .map((a) => a.name?.trim())
      .filter((name): name is string => {
        if (!name) return false;
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .join(', ');

    // Prefer the cover ID URL from the API; fall back to the ISBN-keyed URL.
    // HEAD-check with ?default=false so we only store the URL when a real image exists.
    const candidateCover = entry.cover?.medium ?? `${OL_COVERS}/${isbn}-M.jpg`;
    let cover_url = '';
    try {
      const check = await fetch(`${candidateCover}?default=false`, { method: 'HEAD' });
      if (check.ok) cover_url = candidateCover;
    } catch {
      // leave cover_url empty
    }

    return { title: entry.title, author, cover_url };
  } catch {
    return null;
  }
}

async function fetchAndStageBatch(db: D1Database, isbns: string[]) {
  for (let i = 0; i < isbns.length; i++) {
    if (i > 0) await new Promise<void>((r) => setTimeout(r, RATE_LIMIT_DELAY_MS));
    const result = await fetchOpenLibraryBook(isbns[i]);
    // Only write on success — not-found ISBNs are left absent so the
    // client's retry loop eventually times out and shows the empty form.
    if (result) await cacheBook(db, isbns[i], result);
  }
}

export async function onRequest(context: EventContext<Env, string, Record<string, unknown>>) {
  if (context.request.method !== 'POST') return methodNotAllowed();

  const body = await context.request.json() as { isbns?: unknown };
  if (!Array.isArray(body.isbns)) return error('isbns must be an array');

  const isbns = (body.isbns as unknown[]).filter(
    (s): s is string => typeof s === 'string' && s.trim().length > 0,
  );
  if (isbns.length === 0) return json({ ok: true });

  const uncached = await getUncachedISBNs(context.env.DB, isbns);
  if (uncached.length > 0) {
    context.waitUntil(fetchAndStageBatch(context.env.DB, uncached));
  }

  return json({ ok: true });
}
