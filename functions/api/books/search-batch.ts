import { cacheBook, getUncachedISBNs } from '../_lib/db';
import { error, json, methodNotAllowed } from '../_lib/response';
import type { Env } from '../_lib/types';

const OL_BOOKS_API = 'https://openlibrary.org/api/books';
const OL_COVERS = 'https://covers.openlibrary.org/b/isbn';
const USER_AGENT = 'Trellis/1.0 (trellis-library-app)';
const RATE_LIMIT_DELAY_MS = 1100; // 1 req/s with a small buffer

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

type OLBooksEntry = {
  title?: string;
  authors?: Array<{ name: string }>;
  cover?: { small?: string; medium?: string; large?: string };
};

// Downloads the cover from Open Library and stores it in R2 so we don't depend
// on OL's availability at view time. ?default=false makes OL 404 when there is
// no real cover. Returns the local serving path, or '' when none exists.
async function replicateCover(r2: R2Bucket, url: string): Promise<string> {
  try {
    const res = await fetch(`${url}?default=false`, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) {
      console.warn(`[cover] fetch failed ${res.status} for ${url}`);
      return '';
    }
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0) {
      console.warn(`[cover] empty body for ${url}`);
      return '';
    }
    const ext = EXT[contentType] ?? 'jpg';
    const key = `${crypto.randomUUID()}.${ext}`;
    await r2.put(key, buf, { httpMetadata: { contentType } });
    return `/api/covers/${key}`;
  } catch (e) {
    console.warn(`[cover] error for ${url}: ${(e as Error).message}`);
    return '';
  }
}

async function fetchOpenLibraryBook(
  r2: R2Bucket,
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

    // Prefer the large cover-ID URL from the API; fall back to the ISBN-keyed
    // large image. Large (~full res) looks sharp in the fullscreen lightbox and
    // downscales cleanly for cards; it's still only ~40KB.
    const candidateCover = entry.cover?.large ?? `${OL_COVERS}/${isbn}-L.jpg`;
    const cover_url = await replicateCover(r2, candidateCover);

    return { title: entry.title, author, cover_url };
  } catch {
    return null;
  }
}

async function fetchAndStageBatch(env: Env, isbns: string[]) {
  for (let i = 0; i < isbns.length; i++) {
    if (i > 0) await new Promise<void>((r) => setTimeout(r, RATE_LIMIT_DELAY_MS));
    const result = await fetchOpenLibraryBook(env.R2, isbns[i]);
    // Only write on success — not-found ISBNs are left absent so the
    // client's retry loop eventually times out and shows the empty form.
    if (result) await cacheBook(env.DB, isbns[i], result);
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
    context.waitUntil(fetchAndStageBatch(context.env, uncached));
  }

  return json({ ok: true });
}
