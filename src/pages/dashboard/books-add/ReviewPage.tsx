import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageShell } from '@/components/layout/PageShell';
import { getBookSearchResult, saveBookCopy, uploadCoverImage } from '@/api/books';
import { useAddBooks } from '@/context/AddBooksContext';
import type { BookDraft } from '@/context/AddBooksContext';
import { CoverUpload } from './CoverUpload';

const RETRY_DELAY_MS = 2500;
const MAX_RETRIES = 2;

type FetchState = 'loading' | 'found' | 'not_found';

export function AddBooksReviewPage() {
  const { index } = useParams<{ index: string }>();
  const { isbns, drafts, updateDraft } = useAddBooks();
  const navigate = useNavigate();

  const i = parseInt(index ?? '0', 10);
  const isbn = isbns[i];
  const draft = isbn ? drafts[isbn] : undefined;

  const [fetchState, setFetchState] = useState<FetchState>('loading');
  const [saving, setSaving] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Redirect if context has no ISBNs (e.g. direct URL access)
  useEffect(() => {
    if (isbns.length === 0) {
      navigate('/dashboard/books/add', { replace: true });
    }
  }, [isbns.length, navigate]);

  // Fetch book data with retries on each isbn change
  useEffect(() => {
    if (!isbn) return;
    let cancelled = false;

    setFetchState('loading');
    setAttemptedSave(false);

    async function fetchWithRetries() {
      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;
        if (attempt > 0) {
          await new Promise<void>((r) => setTimeout(r, RETRY_DELAY_MS));
        }
        if (cancelled) return;

        const result = await getBookSearchResult(isbn);
        if (cancelled) return;

        if (result.status !== 'pending') {
          if (result.status === 'found') {
            setFetchState('found');
            // Auto-fill only empty fields so user edits aren't overwritten
            updateDraft(isbn, {
              title: drafts[isbn]?.title || result.data.title,
              author: drafts[isbn]?.author || result.data.author,
              cover_url: drafts[isbn]?.cover_url || (result.data.cover_url ?? ''),
              description: drafts[isbn]?.description || (result.data.description ?? ''),
            });
          } else {
            setFetchState('not_found');
          }
          return;
        }

        if (attempt === MAX_RETRIES) {
          if (!cancelled) setFetchState('not_found');
        }
      }
    }

    fetchWithRetries();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isbn]);

  if (!isbn || !draft) return null;

  const isLast = i === isbns.length - 1;

  function goNext() {
    if (isLast) navigate('/dashboard/books');
    else navigate(`/dashboard/books/add/review/${i + 1}`);
  }

  async function handleSave() {
    if (!draft) return;
    setAttemptedSave(true);
    if (!draft.title.trim() || !draft.author.trim()) return;
    setSaving(true);
    try {
      await saveBookCopy(draft);
      goNext();
    } finally {
      setSaving(false);
    }
  }

  function handleSkip() {
    goNext();
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadCoverImage(file);
      update({ cover_url: url });
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  }

  function update(updates: Partial<BookDraft>) {
    updateDraft(isbn, updates);
  }

  const titleError = attemptedSave && !draft.title.trim();
  const authorError = attemptedSave && !draft.author.trim();

  return (
    <PageShell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="space-y-0.5">
          <p className="text-sm text-muted-foreground">
            Book {i + 1} of {isbns.length}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Add Book</h1>
          <p className="font-mono text-sm text-muted-foreground">{isbn}</p>
        </div>

        {/* Search status */}
        {fetchState === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Searching for book info…
          </div>
        )}
        {fetchState === 'not_found' && (
          <p className="text-sm text-muted-foreground">
            No results found — fill in the details below.
          </p>
        )}

        {/* Two-column: cover left, form right */}
        <div className="flex gap-8 items-start">

          <CoverUpload
            coverUrl={draft.cover_url}
            uploading={uploadingCover}
            onUpload={handleCoverUpload}
            onRemove={() => update({ cover_url: '' })}
          />

          {/* Form column */}
          <div className="flex-1 min-w-0 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={draft.title}
                onChange={(e) => update({ title: e.target.value })}
                aria-invalid={titleError}
                className={titleError ? 'border-destructive' : ''}
              />
              {titleError && (
                <p className="text-xs text-destructive">Title is required</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="author">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="author"
                value={draft.author}
                onChange={(e) => update({ author: e.target.value })}
                aria-invalid={authorError}
                className={authorError ? 'border-destructive' : ''}
              />
              {authorError && (
                <p className="text-xs text-destructive">Author is required</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={draft.description}
                onChange={(e) => update({ description: e.target.value })}
                className="h-24 resize-none"
              />
            </div>

            {/* Owner's note */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="owner-note"
                  checked={draft.has_owner_note}
                  onCheckedChange={(checked) =>
                    update({ has_owner_note: !!checked })
                  }
                />
                <Label htmlFor="owner-note" className="cursor-pointer font-normal">
                  Add owner's note
                </Label>
              </div>
              {draft.has_owner_note && (
                <Textarea
                  value={draft.owner_note}
                  onChange={(e) => update({ owner_note: e.target.value })}
                  placeholder="e.g. Paperback, slight crease on cover"
                  className="h-20 resize-none"
                />
              )}
            </div>

            {/* Status toggle */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex w-fit overflow-hidden rounded-md border text-sm font-medium">
                <button
                  type="button"
                  onClick={() => update({ status: 'available' })}
                  className={`px-4 py-1.5 transition-colors ${
                    draft.status === 'available'
                      ? 'bg-lime-600 text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Available
                </button>
                <button
                  type="button"
                  onClick={() => update({ status: 'unavailable' })}
                  className={`border-l px-4 py-1.5 transition-colors ${
                    draft.status === 'unavailable'
                      ? 'bg-rose-600 text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Unavailable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={handleSkip} disabled={saving}>
            Skip
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving…
              </>
            ) : isLast ? (
              'Save & finish'
            ) : (
              'Save & continue'
            )}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
