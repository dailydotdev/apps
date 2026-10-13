import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ArrowIcon, PlayIcon } from '@dailydotdev/shared/src/components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { HistoryItem } from './data';
import { groupByDay } from './data';
import { Highlight, Meta, Row, RowActions, StateMarks, Thumb } from './kit';

// The reading list every layout shares: days with a sticky label, every
// post as the same row under its day.

/** A big video card for the row that leads a day. */
const VideoCard = ({
  item,
  query,
}: {
  item: HistoryItem;
  query?: string;
}): ReactElement => (
  <a
    href={item.permalink}
    onClick={(event) => event.preventDefault()}
    className="hx-row group flex w-[calc((100%-1.5rem)/3)] shrink-0 snap-start flex-col gap-2 rounded-20 p-2 hover:bg-surface-hover"
  >
    {/* Production's VideoImage treatment: dark tint, play icon centered. */}
    <span className="relative flex items-center justify-center">
      <Thumb item={item} className="aspect-video w-full rounded-16" />
      <span className="pointer-events-none absolute inset-0 rounded-16 bg-overlay-tertiary-black" />
      <PlayIcon
        secondary
        size={IconSize.XXLarge}
        className="pointer-events-none absolute"
      />
    </span>
    <span className="flex items-start gap-1 px-1">
      <span className="line-clamp-2 flex-1 font-bold typo-callout">
        <Highlight text={item.title} query={query} />
      </span>
      <RowActions item={item} className="-mr-1 -mt-1" />
    </span>
    <Meta item={item} className="px-1" extra={<StateMarks item={item} />} />
  </a>
);

/**
 * The squads discover rail (featured.tsx), trimmed: knows whether it can
 * still move each way, and slides a page of whole cards per press.
 */
const useRail = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = () => {
    const node = ref.current;
    const first = node?.firstElementChild as HTMLElement | null;
    if (!node || !first) {
      return null;
    }
    const gap = parseFloat(getComputedStyle(node).columnGap) || 0;
    const step = first.offsetWidth + gap;
    return {
      node,
      step,
      perPage: Math.max(1, Math.floor((node.clientWidth + gap) / step)),
    };
  };

  const update = useCallback(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    // Snap can leave a rail a few pixels off either end.
    const slack = 32;
    setEdges({
      start: node.scrollLeft <= slack,
      end: node.scrollLeft + node.clientWidth >= node.scrollWidth - slack,
    });
  }, []);
  useEffect(update, [update]);

  const scroll = (direction: 1 | -1) => {
    const metrics = measure();
    metrics?.node.scrollBy({
      left: direction * metrics.perPage * metrics.step,
      behavior: 'smooth',
    });
  };
  return { ref, scroll, onScroll: update, ...edges };
};

/**
 * A day's videos as a rail of three at a time, with the squads discover
 * arrows (the chosen Float square) on the thumbnails' middle. Each press
 * brings the next three.
 */
const VideoRail = ({
  items,
  query,
}: {
  items: HistoryItem[];
  query?: string;
}): ReactElement => {
  const { ref, scroll, onScroll, start, end } = useRail();
  const arrow = (side: 'left' | 'right') => (
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Float}
      aria-label={side === 'left' ? 'Previous videos' : 'Next videos'}
      icon={
        <ArrowIcon
          size={IconSize.Medium}
          className={side === 'left' ? '-rotate-90' : 'rotate-90'}
        />
      }
      onClick={() => scroll(side === 'left' ? -1 : 1)}
      className={classNames(
        'absolute top-[5.5rem] z-2 -translate-y-1/2 shadow-2 backdrop-blur-[1.25rem]',
        side === 'left' ? '-left-3' : '-right-3',
      )}
    />
  );
  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar -mx-2 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
      >
        {items.map((item) => (
          <VideoCard key={item.key} item={item} query={query} />
        ))}
      </div>
      {!start && arrow('left')}
      {!end && arrow('right')}
    </div>
  );
};

export const Timeline = ({
  items,
  query,
  compact = false,
  videosFirst = false,
  tldr,
  renderItem,
}: {
  items: HistoryItem[];
  query?: string;
  /** A narrow column, for the Reader pane's list. */
  compact?: boolean;
  /** Lead each day with its videos as a row of big cards. */
  videosFirst?: boolean;
  tldr?: boolean;
  renderItem?: (item: HistoryItem) => ReactNode;
}): ReactElement => {
  return (
    <div className={classNames('flex flex-col', compact ? 'gap-4' : 'gap-8')}>
      {groupByDay(items).map((day) => (
        <section
          key={day.id}
          className={classNames('flex flex-col', compact ? 'gap-1' : 'gap-3')}
        >
          <h2
            className={classNames(
              'sticky top-0 z-2 -mx-2 bg-background-default/95 px-2 py-2 font-bold backdrop-blur',
              compact ? 'typo-callout' : 'typo-title3',
            )}
          >
            {day.label}
          </h2>
          {videosFirst && day.items.some((item) => item.type === 'video') && (
            <h3 className="flex items-center gap-2 font-bold typo-title3">
              <PlayIcon
                size={IconSize.Medium}
                className="text-accent-cabbage-default"
              />
              Videos
            </h3>
          )}
          {videosFirst && day.items.some((item) => item.type === 'video') && (
            <VideoRail
              items={day.items.filter((item) => item.type === 'video')}
              query={query}
            />
          )}
          <div className={classNames('flex flex-col', !compact && '-mx-3')}>
            {(videosFirst
              ? day.items.filter((item) => item.type !== 'video')
              : day.items
            ).map(
              (item) =>
                renderItem?.(item) ?? (
                  <Row key={item.key} item={item} query={query} tldr={tldr} />
                ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
};
