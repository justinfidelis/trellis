import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

interface CoverZoomProps {
  src: string;
  title: string;
  /** Classes for the inline (trigger) image. Defaults to a contained fill. */
  className?: string;
}

// Click the cover to open a larger overlay; close by clicking outside or pressing Esc.
export function CoverZoom({ src, title, className }: CoverZoomProps) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            aria-label={`View larger cover of ${title}`}
            className="block h-full w-full cursor-zoom-in outline-none"
          >
            <img
              src={src}
              alt={`Cover of ${title}`}
              className={className ?? 'h-full w-full object-contain'}
            />
          </button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/70 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <img
            src={src}
            alt={`Cover of ${title}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
