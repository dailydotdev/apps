import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { AnnouncementCard } from './AnnouncementCard';
import { AnnouncementCardVariant } from './types';
import type { AnnouncementItem } from './types';
import CarouselIndicator from '../containers/CarouselIndicator';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

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
  const count = items.length;
  // Items shrink as cards are dismissed; keep the index in range.
  const safeActive = Math.min(active, Math.max(count - 1, 0));
  const current = items[safeActive];

  useEffect(() => {
    if (current) {
      onView?.(current);
    }
    // Re-run when the visible card changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (!current) {
    return null;
  }

  const hasMultiple = count > 1;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
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
        onClose={() => onDismiss(current.id)}
      />
      {hasMultiple && (
        <div className="flex items-center justify-between px-1">
          <CarouselIndicator
            active={safeActive}
            max={count}
            onItemClick={setActive}
          />
          <div className="flex items-center gap-1">
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
            >
              {safeActive + 1} of {count}
            </Typography>
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              aria-label="Previous announcement"
              disabled={safeActive === 0}
              icon={<ArrowIcon className="-rotate-90" />}
              onClick={() => setActive((index) => Math.max(0, index - 1))}
            />
            <Button
              type="button"
              size={ButtonSize.XSmall}
              variant={ButtonVariant.Tertiary}
              aria-label="Next announcement"
              disabled={safeActive >= count - 1}
              icon={<ArrowIcon className="rotate-90" />}
              onClick={() =>
                setActive((index) => Math.min(count - 1, index + 1))
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AnnouncementCarousel;
