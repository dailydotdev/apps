import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../../hooks';
import { getLastActivityDateFormat } from '../../../lib/dateFormat';
import type { SentimentAnnotation, SentimentHighlightItem } from './types';
import { stripTcoLinks } from './ArenaHighlightUtils';

const decodeHtmlEntities = (text: string): string => {
  const textarea =
    typeof document !== 'undefined' && document.createElement('textarea');
  if (!textarea) {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  textarea.innerHTML = text;
  return textarea.value;
};

const getSentimentColor = (score: number): string => {
  if (score > 0.2) {
    return 'bg-accent-avocado-default';
  }
  if (score < -0.2) {
    return 'bg-accent-ketchup-default';
  }
  return 'bg-text-quaternary';
};

const Placeholder = ({ className }: { className?: string }): ReactElement => (
  <div
    className={classNames(
      'animate-pulse rounded-8 bg-surface-float',
      className,
    )}
  />
);

const SentimentPill = ({
  sentiment,
}: {
  sentiment: SentimentAnnotation;
}): ReactElement => {
  return (
    <span className="inline-flex items-center gap-1 rounded-8 bg-surface-float px-2 py-0.5 leading-none text-text-secondary typo-caption2">
      <span
        className={classNames(
          'inline-block h-1.5 w-1.5 shrink-0 rounded-full',
          getSentimentColor(sentiment.score),
        )}
      />
      <span className="capitalize">{sentiment.entity.replace(/_/g, ' ')}</span>
    </span>
  );
};

const AuthorAvatar = ({
  author,
}: {
  author?: SentimentHighlightItem['author'];
}): ReactElement => {
  if (author?.avatarUrl) {
    return (
      <img
        src={author.avatarUrl}
        alt={author.name ?? author.handle ?? ''}
        className="h-8 w-8 rounded-full bg-surface-float object-cover"
      />
    );
  }

  const initials = (author?.name ?? author?.handle ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-surface-tertiary flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary typo-caption2">
      {initials}
    </div>
  );
};

const HighlightCard = ({
  item,
}: {
  item: SentimentHighlightItem;
}): ReactElement => {
  const cleanText = decodeHtmlEntities(stripTcoLinks(item.text));

  return (
    <div className="flex gap-3 px-4 py-3">
      <AuthorAvatar author={item.author} />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          {item.author?.name && (
            <span className="shrink truncate font-bold text-text-primary typo-caption1">
              {item.author.name}
            </span>
          )}
          {item.author?.handle && (
            <span className="shrink truncate text-text-quaternary typo-caption2">
              @{item.author.handle}
            </span>
          )}
          <span className="shrink-0 text-text-disabled typo-caption2">
            &middot; {getLastActivityDateFormat(item.createdAt)}
          </span>
        </div>

        <p className="whitespace-pre-wrap break-words text-text-secondary typo-callout">
          {cleanText}
        </p>

        {item.sentiments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.sentiments.map((sentiment) => (
              <SentimentPill key={sentiment.entity} sentiment={sentiment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PlaceholderCard = (): ReactElement => (
  <div className="flex gap-3 px-4 py-3">
    <Placeholder className="h-8 w-8 shrink-0 rounded-full" />
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <Placeholder className="h-3 w-16" />
        <Placeholder className="h-3 w-12" />
      </div>
      <Placeholder className="h-10 w-full" />
      <div className="flex gap-1.5">
        <Placeholder className="h-5 w-16 rounded-8" />
        <Placeholder className="h-5 w-14 rounded-8" />
      </div>
    </div>
  </div>
);

const MOBILE_FEED_LIMIT = 5;
const MAX_HIGHLIGHTS = 100;

interface ArenaHighlightsFeedProps {
  items: SentimentHighlightItem[];
  loading?: boolean;
}

export const ArenaHighlightsFeed = ({
  items,
  loading,
}: ArenaHighlightsFeedProps): ReactElement => {
  const [visibleItems, setVisibleItems] = useState<SentimentHighlightItem[]>(
    [],
  );
  const [pendingItems, setPendingItems] = useState<SentimentHighlightItem[]>(
    [],
  );
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const isLaptop = useViewSize(ViewSize.LaptopL);
  const initializedRef = useRef(false);
  const visibleIdsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    visibleIdsRef.current = new Set(
      visibleItems.map((item) => item.externalItemId),
    );
  }, [visibleItems]);

  useEffect(() => {
    if (items.length === 0) {
      initializedRef.current = false;
      setVisibleItems([]);
      setPendingItems([]);
      return;
    }

    if (!initializedRef.current) {
      initializedRef.current = true;
      setVisibleItems(items.slice(0, MAX_HIGHLIGHTS));
      setPendingItems([]);
      return;
    }

    const newItems = items.filter(
      (item) => !visibleIdsRef.current.has(item.externalItemId),
    );

    if (newItems.length > 0) {
      setPendingItems((prev) =>
        [...newItems, ...prev].slice(0, MAX_HIGHLIGHTS),
      );
    }
  }, [items]);

  const showPending = (): void => {
    setVisibleItems((prev) =>
      [...pendingItems, ...prev].slice(0, MAX_HIGHLIGHTS),
    );
    setPendingItems([]);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayItems =
    isLaptop || mobileExpanded
      ? visibleItems
      : visibleItems.slice(0, MOBILE_FEED_LIMIT);
  const hasMoreOnMobile =
    !isLaptop && !mobileExpanded && visibleItems.length > MOBILE_FEED_LIMIT;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-subtle">
      <div className="flex items-center border-b border-border-subtlest-tertiary px-4 py-2.5">
        <span className="font-bold text-text-primary typo-callout">
          Live Highlights
        </span>
      </div>

      {!loading && pendingItems.length > 0 && (
        <div className="z-10 pointer-events-none absolute inset-x-0 top-12 flex justify-center">
          <button
            type="button"
            onClick={showPending}
            className="animate-slide-down pointer-events-auto rounded-12 bg-accent-cabbage-default px-4 py-1.5 font-bold text-white shadow-2 transition-transform typo-caption1 hover:scale-105 active:scale-95"
          >
            &#x2191; +{pendingItems.length} new post
            {pendingItems.length !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="slim-scrollbar flex min-h-0 flex-1 flex-col divide-y divide-border-subtlest-tertiary overflow-y-auto"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <PlaceholderCard key={i} />
            ))
          : displayItems.map((item) => (
              <HighlightCard key={item.externalItemId} item={item} />
            ))}
      </div>

      {!loading && hasMoreOnMobile && (
        <button
          type="button"
          onClick={() => setMobileExpanded(true)}
          className="active:opacity-80 border-t border-border-subtlest-tertiary px-4 py-3 text-center font-bold text-text-link typo-callout laptopL:hidden"
        >
          Show all {visibleItems.length} highlights
        </button>
      )}
    </div>
  );
};
