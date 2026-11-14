import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageShell } from '@/components/layout/PageShell';
import { parseISBNList, getISBNError } from '@/lib/isbn';
import { useAddBooks } from '@/context/AddBooksContext';

export function AddBooksInputPage() {
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submitISBNs } = useAddBooks();
  const navigate = useNavigate();

  const entries = useMemo(
    () => parseISBNList(input).map((isbn) => ({ isbn, error: getISBNError(isbn) })),
    [input]
  );

  const validISBNs = entries.filter((e) => !e.error).map((e) => e.isbn);

  async function handleSubmit() {
    if (validISBNs.length === 0) return;
    setSubmitting(true);
    await submitISBNs(validISBNs);
    navigate('/dashboard/books/add/review/0');
  }

  return (
    <PageShell>
      <div className="space-y-6 max-w-lg">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold tracking-tight">Add Books</h1>
          <p className="text-sm text-muted-foreground">
            Paste a list of ISBNs.
          </p>
        </div>

        <Textarea
          className="font-mono h-40 resize-none"
          placeholder={'9780525559474, 9780593311929, 9780385545396'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitting}
        />

        {entries.length > 0 && (
          <ul className="space-y-1.5">
            {entries.map(({ isbn, error }) => (
              <li key={isbn} className="flex items-center gap-2 text-sm">
                {!error ? (
                  <CheckCircle2 className="size-4 text-lime-600 shrink-0" />
                ) : (
                  <AlertCircle className="size-4 text-amber-500 shrink-0" />
                )}
                <span className={`font-mono ${error ? 'text-muted-foreground' : ''}`}>{isbn}</span>
                {error && (
                  <span className="text-xs text-muted-foreground">{error}</span>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end">
          <Button
            disabled={validISBNs.length === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting
              ? 'Submitting…'
              : `Search ${validISBNs.length > 0 ? validISBNs.length : ''} book${validISBNs.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
