import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import type { SentimentHighlightItem } from './types';

const SCROLL_SPEED = 0.5;

export const stripTcoLinks = (text: string): string =>
  text.replace(/https?:\/\/t\.co\/\S+/g, '').trim();

export const formatTimeAgo = (createdAt: string): string => {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const getSentiment = (
  item: SentimentHighlightItem,
): 'positive' | 'negative' | 'neutral' => {
  if (item.sentiments.length === 0) {
    return 'neutral';
  }
  const avgScore =
    item.sentiments.reduce((sum, s) => sum + s.score, 0) /
    item.sentiments.length;
  if (avgScore > 0.2) {
    return 'positive';
  }
  if (avgScore < -0.2) {
    return 'negative';
  }
  return 'neutral';
};

const SENTIMENT_DOT: Record<string, string> = {
  positive: 'bg-accent-avocado-default',
  negative: 'bg-accent-ketchup-default',
  neutral: 'bg-accent-cheese-default',
};

const TickerItemView = ({
  item,
}: {
  item: SentimentHighlightItem;
}): ReactElement => {
  const sentiment = getSentiment(item);
  const cleanText = stripTcoLinks(item.text);

  return (
    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${SENTIMENT_DOT[sentiment]}`}
      />
      <span className="max-w-xs truncate text-text-secondary typo-caption2">
        {cleanText}
      </span>
      {item.author?.handle && (
        <span className="text-text-quaternary typo-caption2">
          — @{item.author.handle}
        </span>
      )}
      <span className="text-text-disabled typo-caption2">
        {formatTimeAgo(item.createdAt)}
      </span>
    </div>
  );
};

interface ArenaLiveTickerProps {
  items: SentimentHighlightItem[];
}

export const ArenaLiveTicker = ({
  items,
}: ArenaLiveTickerProps): ReactElement | null => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>();

  const tick = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    offsetRef.current += SCROLL_SPEED;

    const halfWidth = el.scrollWidth / 2;
    if (halfWidth > 0 && offsetRef.current >= halfWidth) {
      offsetRef.current -= halfWidth;
    }

    el.style.transform = `translateX(-${offsetRef.current}px)`;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [tick]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-surface-float">
      <div className="pointer-events-none absolute left-0 top-0 z-1 h-full w-8 bg-gradient-to-r from-surface-float to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-1 h-full w-8 bg-gradient-to-l from-surface-float to-transparent" />

      <div className="flex items-center gap-4 overflow-hidden px-4 py-2">
        <div
          ref={scrollRef}
          className="flex items-center gap-6 will-change-transform"
        >
          {items.map((item) => (
            <TickerItemView key={item.externalItemId} item={item} />
          ))}
          {items.map((item) => (
            <TickerItemView
              key={`dup-${item.externalItemId}`}
              item={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
