import { BookOpen } from 'lucide-react';

interface CoverImageProps {
  src: string | null;
  title: string;
  className?: string;
  iconClassName?: string;
}

export function CoverImage({ src, title, className = '', iconClassName = 'w-10 h-10' }: CoverImageProps) {
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
      <BookOpen className={`opacity-40 ${iconClassName}`} />
    </div>
  );
}
