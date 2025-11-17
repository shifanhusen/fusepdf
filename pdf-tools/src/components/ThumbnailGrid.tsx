import clsx from 'clsx';
import type { ThumbnailPage } from '../types/pdf';

interface ThumbnailGridProps {
  thumbnails: ThumbnailPage[];
  selectable?: boolean;
  selectedPages?: Set<number>;
  onToggle?: (pageNumber: number) => void;
  compact?: boolean;
}

export function ThumbnailGrid({
  thumbnails,
  selectable,
  selectedPages,
  onToggle,
  compact,
}: ThumbnailGridProps) {
  return (
    <div className={clsx('grid gap-3', compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5')}>
      {thumbnails.map((thumb) => {
        const isSelected = selectedPages?.has(thumb.page);
        return (
          <button
            type="button"
            key={thumb.page}
            onClick={() => selectable && onToggle?.(thumb.page)}
            className={clsx(
              'group relative overflow-hidden rounded-xl border border-surface-border bg-surface-muted/60 p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
              selectable && 'hover:border-brand-blue/70',
              isSelected && 'border-brand-blue shadow-glow',
            )}
          >
            <img
              src={thumb.dataUrl}
              alt={`Page ${thumb.page}`}
              className="h-32 w-full rounded-lg object-cover"
              loading="lazy"
            />
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/70 px-2 text-xs font-semibold text-white">
              {thumb.page}
            </span>
            {selectable && (
              <span
                className={clsx(
                  'pointer-events-none absolute right-2 top-2 rounded-full border px-2 text-xs font-semibold transition',
                  isSelected ? 'bg-brand-green/80 text-black' : 'bg-black/60 text-white',
                )}
              >
                {isSelected ? 'Selected' : 'Tap to select'}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
