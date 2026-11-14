import { useRef } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoverZoom } from '@/components/books/CoverZoom';

interface CoverUploadProps {
  coverUrl: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export function CoverUpload({ coverUrl, uploading, onUpload, onRemove }: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="shrink-0 flex flex-col gap-3">
      <div className="relative w-40 h-56 rounded border bg-muted flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <CoverZoom src={coverUrl} title="book" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {coverUrl ? 'Change image' : 'Upload image'}
      </Button>
      {coverUrl && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={uploading}
          className="w-full text-muted-foreground"
        >
          Remove
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
      />
    </div>
  );
}
