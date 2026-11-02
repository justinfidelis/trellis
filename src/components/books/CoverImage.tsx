import { BookOpen } from 'lucide-react';

interface CoverImageProps {
  src: string | null;
  title: string;
  className?: string;
}

export function CoverImage({ src, title, className = '' }: CoverImageProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={`Cover of ${title}`}
        className={`object-cover w-full h-full ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center w-full h-full bg-muted text-muted-foreground ${className}`}
    >
      <BookOpen className="w-10 h-10 opacity-40" />
    </div>
  );
}
