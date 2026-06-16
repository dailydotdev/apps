import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementCardVariant } from './types';
import type { AnnouncementItem } from './types';

const EXIT_MS = 200;
// How long a card must stay active before it counts as a genuine impression —
// long enough that hovering across the dots to browse doesn't log every card.
const VIEW_DWELL_MS = 400;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface AnnouncementCarouselProps {
  items: AnnouncementItem[];
  onDismiss: (id: string) => void;
  // Fired when a card becomes the active (visible) one — for impressions.
  onView?: (item: AnnouncementItem) => void;
  // Fired when a Compact card's row is clicked.
  onItemClick?: (item: AnnouncementItem) => void;
  className?: string;
}

export function AnnouncementCarousel({
  items,
  onDismiss,
  onView,
  onItemClick,
  className,
}: AnnouncementCarouselProps): ReactElement | null {
  const [active, setActive] = useState(0);
  const [exitingId, setExitingId] = useState<string | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout>>();
  const viewTimer = useRef<ReturnType<typeof setTimeout>>();
  // Ids already counted as viewed, so scrubbing back and forth never
  // double-logs an impression.
  const viewedRef = useRef<Set<string>>(new Set());

  const count = items.length;
  // Items shrink as cards are dismissed; keep the index in range.
  const safeActive = Math.min(active, Math.max(count - 1, 0));
  const current = items[safeActive];

  // Log an impression only after a card has settled (dwell) and only once —
  // hovering across the dots to browse the stack shouldn't fire impressions.
  useEffect(() => {
    const id = current?.id;
    if (!id || viewedRef.current.has(id)) {
      return undefined;
    }
    viewTimer.current = setTimeout(() => {
      viewedRef.current.add(id);
      onView?.(current);
    }, VIEW_DWELL_MS);
    return () => clearTimeout(viewTimer.current);
    // Re-run only when the visible card changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  useEffect(
    () => () => {
      clearTimeout(exitTimer.current);
      clearTimeout(viewTimer.current);
    },
    [],
  );

  if (!current) {
    return null;
  }

  const goTo = (index: number): void => {
    setActive(Math.max(0, Math.min(count - 1, index)));
  };

  const handleDismiss = (id: string): void => {
    // Animate the card out, then let the parent remove it so the next card
    // slides into its place. Skip the delay when motion is reduced.
    if (prefersReducedMotion()) {
      onDismiss(id);
      return;
    }
    setExitingId(id);
    exitTimer.current = setTimeout(() => {
      setExitingId(null);
      onDismiss(id);
    }, EXIT_MS);
  };

  const hasMultiple = count > 1;
  const isExiting = exitingId === current.id;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What's new"
      className={classNames('flex flex-col gap-2', className)}
    >
      <div className="group/stack relative isolate">
        {hasMultiple && (
          // A single card peeking behind, occluded by the active card so only
          // its bottom edge shows — like a notification stack. On hover the
          // stack "opens": the card behind slides out and brightens.
          <div
            aria-hidden
            className="opacity-60 group-hover/stack:opacity-80 absolute inset-x-2 -bottom-2 top-2 z-0 rounded-16 border border-border-subtlest-quaternary bg-background-subtle transition-all duration-200 ease-out motion-safe:group-hover/stack:-bottom-3"
          />
        )}
        <div
          key={current.id}
          className={classNames(
            'z-10 relative transition-all duration-200 ease-out motion-safe:animate-composer-in',
            isExiting && 'translate-y-2 scale-[0.98] opacity-0',
          )}
        >
          <AnnouncementCard
            variant={current.variant}
            title={current.title}
            description={current.description}
            badge={current.badge}
            icon={current.icon}
            image={current.image}
            cta={current.cta}
            href={current.href}
            onClick={
              current.variant === AnnouncementCardVariant.Compact && onItemClick
                ? () => onItemClick(current)
                : undefined
            }
            onClose={() => handleDismiss(current.id)}
            className={
              hasMultiple
                ? 'shadow-[0_4px_12px_-6px_rgba(0,0,0,0.25)] hover:shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)]'
                : undefined
            }
          />
        </div>
      </div>

      {hasMultiple && (
        // Centered segmented indicator. Hovering or focusing a dot switches to
        // that announcement (this lives in the desktop sidebar; click/focus
        // cover keyboard and any non-hover input). The active dot stretches
        // into a pill and the fill glides between positions.
        <div className="flex items-center justify-center gap-1.5 pt-2.5">
          {items.map((item, index) => {
            const isActive = index === safeActive;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={`Show announcement ${index + 1} of ${count}`}
                aria-current={isActive}
                onMouseEnter={() => goTo(index)}
                onFocus={() => goTo(index)}
                onClick={() => goTo(index)}
                className={classNames(
                  'h-1.5 rounded-2 transition-all duration-300 ease-out',
                  isActive
                    ? 'w-4 bg-text-primary'
                    : 'w-1.5 bg-text-quaternary hover:bg-text-tertiary',
                )}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AnnouncementCarousel;
