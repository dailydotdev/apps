import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import { WidgetContainer } from '../../widgets/common';
import { getHighlightsUrl, highlightsTitleGradientClassName } from './common';
import {
  majorHeadlinesQueryOptions,
  type PostHighlight,
} from '../../../graphql/highlights';
import { RelativeTime } from '../../utilities/RelativeTime';
import Link from '../../utilities/Link';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featurePostPageHighlights } from '../../../lib/featureManagement';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, Origin } from '../../../lib/log';
import { feedHighlightsLogEvent } from '../../../lib/feed';
import useLogEventOnce from '../../../hooks/log/useLogEventOnce';
import { ONE_HOUR, ONE_MINUTE } from '../../../lib/time';

const HIGHLIGHTS_LIMIT = 10;
const ROTATION_INTERVAL_MS = 6000;
const FADE_DURATION_MS = 500;
const FEED_NAME = 'post-page-highlights';
const MAX_HIGHLIGHT_AGE_MS = 24 * ONE_HOUR;

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const HighlightPostSidebarWidget = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { value: isEnabled } = useConditionalFeature({
    feature: featurePostPageHighlights,
    shouldEvaluate: !!user,
  });

  const { data } = useQuery({
    ...majorHeadlinesQueryOptions({ first: HIGHLIGHTS_LIMIT }),
    enabled: isEnabled && !!user,
    refetchInterval: ONE_MINUTE,
  });

  const cutoff = Date.now() - MAX_HIGHLIGHT_AGE_MS;
  const highlights: PostHighlight[] = (
    data?.majorHeadlines?.edges?.map((edge) => edge.node) ?? []
  ).filter((h) => new Date(h.highlightedAt).getTime() >= cutoff);

  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const fadeOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasHighlights = highlights.length > 0;
  const shouldRender = isEnabled && hasHighlights;
  const canRotate = shouldRender && highlights.length > 1 && !isPaused;

  useLogEventOnce(
    () =>
      feedHighlightsLogEvent(LogEvent.Impression, {
        feedName: FEED_NAME,
        action: 'impression',
        count: highlights.length,
        highlightIds: highlights.map((h) => h.id),
        origin: Origin.ArticlePage,
      }),
    { condition: shouldRender },
  );

  useEffect(() => {
    if (index >= highlights.length && highlights.length > 0) {
      setIndex(0);
    }
  }, [highlights.length, index]);

  useEffect(() => {
    if (!canRotate) {
      return undefined;
    }

    const reducedMotion = prefersReducedMotion();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      if (reducedMotion) {
        setIndex((prev) => (prev + 1) % highlights.length);
        return;
      }

      setIsVisible(false);
      fadeOutTimeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % highlights.length);
        setIsVisible(true);
      }, FADE_DURATION_MS);
    }, ROTATION_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
        fadeOutTimeoutRef.current = null;
      }
    };
  }, [canRotate, highlights.length]);

  const onPauseStart = useCallback(() => setIsPaused(true), []);
  const onPauseEnd = useCallback(() => setIsPaused(false), []);

  if (!shouldRender) {
    return null;
  }

  const current = highlights[Math.min(index, highlights.length - 1)];
  const firstHighlight = highlights[0];

  const onHighlightClick = () => {
    logEvent(
      feedHighlightsLogEvent(LogEvent.Click, {
        feedName: FEED_NAME,
        action: 'highlight_click',
        position: index + 1,
        count: highlights.length,
        clickedHighlight: current,
        highlightIds: highlights.map((h) => h.id),
        origin: Origin.ArticlePage,
      }),
    );
  };

  const onReadAllClick = () => {
    logEvent(
      feedHighlightsLogEvent(LogEvent.Click, {
        feedName: FEED_NAME,
        action: 'read_all_click',
        count: highlights.length,
        highlightIds: highlights.map((h) => h.id),
        origin: Origin.ArticlePage,
      }),
    );
  };

  const headlineHref = getHighlightsUrl(current.id);

  return (
    <WidgetContainer
      data-testid="postPageHighlightWidget"
      className="flex flex-col p-3"
      onMouseEnter={onPauseStart}
      onMouseLeave={onPauseEnd}
      onFocus={onPauseStart}
      onBlur={onPauseEnd}
    >
      <h4
        className={classNames(
          highlightsTitleGradientClassName,
          'mb-4 font-bold typo-callout',
        )}
      >
        Happening Now
      </h4>
      <div className="flex min-h-[5rem] flex-col" aria-live="polite">
        <Link href={headlineHref}>
          <a
            className={classNames(
              'flex w-full flex-1 flex-col gap-0.5 rounded-8 text-left transition-opacity duration-500',
              isVisible ? 'opacity-100' : 'opacity-0',
            )}
            href={headlineHref}
            onClick={onHighlightClick}
          >
            <span className="line-clamp-3 break-words font-bold text-text-primary typo-callout">
              {current.headline}
            </span>
            <RelativeTime
              dateTime={current.highlightedAt}
              maxHoursAgo={24}
              className="text-text-tertiary typo-footnote"
            />
          </a>
        </Link>
      </div>
      <Link href={getHighlightsUrl(firstHighlight?.id)}>
        <a
          aria-label="Read all highlights"
          className="mt-2 inline-flex items-center gap-1 self-start typo-footnote"
          href={getHighlightsUrl(firstHighlight?.id)}
          onClick={onReadAllClick}
        >
          <span className={highlightsTitleGradientClassName}>Read all</span>
          <span aria-hidden className={highlightsTitleGradientClassName}>
            →
          </span>
        </a>
      </Link>
    </WidgetContainer>
  );
};
