import type { ReactElement, Ref } from 'react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import type { PostHighlight } from '../../../graphql/highlights';
import { PostType } from '../../../graphql/posts';
import { stripHtmlTags } from '../../../lib/strings';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { ArrowIcon } from '../../icons';
import { IconSize } from '../../Icon';
import Link from '../../utilities/Link';
import { RelativeTime } from '../../utilities/RelativeTime';
import { Tooltip } from '../../tooltip/Tooltip';
import { RootPortal } from '../../tooltips/Portal';
import { ElementPlaceholder } from '../../ElementPlaceholder';
import { getHighlightsUrl, highlightsTitleGradientClassName } from './common';
import { HighlightCardOptions } from './HighlightCardOptions';

export interface HighlightStripProps {
  highlights: PostHighlight[];
  isLoading?: boolean;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  onReadAllClick?: () => void;
  className?: string;
}

const SKELETON_PLACEHOLDER_COUNT = 4;

const formatChannelLabel = (channel: string): string =>
  channel
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

const CHANNEL_TAG_COLORS = [
  'text-accent-cabbage-default',
  'text-accent-cheese-default',
  'text-accent-blueCheese-default',
  'text-accent-avocado-default',
  'text-accent-water-default',
  'text-accent-onion-default',
  'text-accent-bacon-default',
  'text-accent-bun-default',
  'text-accent-lettuce-default',
];

const getChannelColorClass = (channel: string): string => {
  let hash = 0;
  for (let i = 0; i < channel.length; i += 1) {
    hash = (hash * 31 + channel.charCodeAt(i)) % 2147483647;
  }
  const index = Math.abs(hash) % CHANNEL_TAG_COLORS.length;
  return CHANNEL_TAG_COLORS[index];
};

const SCROLL_EDGE_TOLERANCE_PX = 8;
const NEW_HIGHLIGHT_ANIMATION_MS = 2600;
const AUTO_ROTATE_INTERVAL_MS = 6000;
const RESUME_AFTER_INTERACTION_MS = 9000;
const BREAKING_THRESHOLD_MS = 30 * 60 * 1000;
const LAST_SEEN_STORAGE_KEY = 'highlight-strip:last-seen-at';
const CLOSE_TRANSITION_MS = 320;
const SUMMARY_MAX_LENGTH = 320;

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const isBreakingHighlight = (highlightedAt: string): boolean =>
  Date.now() - new Date(highlightedAt).getTime() < BREAKING_THRESHOLD_MS;

const buildScrollMask = (
  fadeStart: boolean,
  fadeEnd: boolean,
): string | undefined => {
  if (!fadeStart && !fadeEnd) {
    return undefined;
  }
  const startStop = fadeStart ? 'transparent 0, #000 32px' : '#000 0, #000 0';
  const endStop = fadeEnd
    ? '#000 calc(100% - 32px), transparent 100%'
    : '#000 100%, #000 100%';
  return `linear-gradient(to right, ${startStop}, ${endStop})`;
};

const truncateSummary = (text: string): string => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= SUMMARY_MAX_LENGTH) {
    return normalized;
  }
  const slice = normalized.slice(0, SUMMARY_MAX_LENGTH);
  const lastSpace = slice.lastIndexOf(' ');
  const safe =
    lastSpace > SUMMARY_MAX_LENGTH * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${safe.trimEnd()}…`;
};

const useHighlightSummary = (highlight: PostHighlight): string =>
  useMemo(() => {
    const target =
      highlight.post.type === PostType.Share && highlight.post.sharedPost
        ? highlight.post.sharedPost
        : highlight.post;
    const trimmedSummary = target.summary?.trim();
    if (trimmedSummary) {
      return truncateSummary(trimmedSummary);
    }
    const trimmedHtml = target.contentHtml?.trim();
    if (trimmedHtml) {
      return truncateSummary(stripHtmlTags(trimmedHtml));
    }
    return '';
  }, [highlight.post]);

interface HighlightCardSurfaceProps {
  highlight: PostHighlight;
  isExpanded: boolean;
  onToggle: () => void;
  variant: 'inline' | 'overlay';
}

const HighlightCardSurface = ({
  highlight,
  isExpanded,
  onToggle,
  variant,
}: HighlightCardSurfaceProps): ReactElement => {
  const summary = useHighlightSummary(highlight);
  const [revealExtras, setRevealExtras] = useState(
    variant === 'overlay' ? false : isExpanded,
  );

  useEffect(() => {
    if (!isExpanded) {
      setRevealExtras(false);
      return undefined;
    }
    const frame = window.requestAnimationFrame(() => setRevealExtras(true));
    return () => window.cancelAnimationFrame(frame);
  }, [isExpanded]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle();
    }
  };

  const stopBubble = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  const isOverlay = variant === 'overlay';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'}: ${
        highlight.headline
      }`}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
      className={classNames(
        'group/item relative flex h-full w-full cursor-pointer flex-col rounded-10 border px-3 py-2 text-left outline-none transition-colors duration-200 ease-out focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent-cabbage-default',
        isOverlay
          ? 'border-border-subtlest-secondary bg-background-popover shadow-[0_18px_40px_rgba(0,0,0,0.55)]'
          : 'border-transparent bg-transparent hover:bg-surface-hover',
      )}
    >
      <span
        className={classNames(
          'break-words font-bold leading-tight text-text-primary typo-callout',
          !isOverlay && 'line-clamp-3',
        )}
      >
        {highlight.headline}
      </span>

      <div
        className={classNames(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          revealExtras ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p
            className={classNames(
              'mt-2.5 break-words leading-loose typo-callout',
              summary ? 'text-text-secondary' : 'text-text-tertiary',
            )}
          >
            {summary || 'No summary yet — open the full article.'}
          </p>
        </div>
      </div>

      <div
        className={classNames(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          revealExtras ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <div
            className="flex flex-wrap items-center gap-1.5 pb-1 pt-4"
            onClick={stopBubble}
            role="presentation"
          >
            <Link href={getHighlightsUrl(highlight.id)}>
              <a
                href={getHighlightsUrl(highlight.id)}
                className="inline-flex items-center gap-1 font-bold text-text-link outline-none typo-footnote hover:underline focus-visible:underline"
              >
                Read more
                <ArrowIcon
                  size={IconSize.XXSmall}
                  className="rotate-90"
                  aria-hidden
                />
              </a>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="flex min-w-0 items-center gap-1.5">
          {isBreakingHighlight(highlight.highlightedAt) && (
            <span className="flex shrink-0 items-center gap-1 rounded-6 bg-accent-ketchup-default px-1.5 py-px font-bold uppercase leading-none tracking-wider text-text-primary typo-caption2">
              <span
                aria-hidden
                className="h-1 w-1 rounded-full bg-text-primary"
              />
              Breaking
            </span>
          )}
          <RelativeTime
            dateTime={highlight.highlightedAt}
            maxHoursAgo={72}
            className="truncate text-text-tertiary typo-caption2"
          />
          {highlight.channel && (
            <span
              className={classNames(
                'inline-flex shrink-0 items-center font-bold uppercase leading-none tracking-wider transition-opacity duration-200 ease-out typo-caption2',
                getChannelColorClass(highlight.channel),
                isOverlay
                  ? 'opacity-100'
                  : 'opacity-0 group-hover/item:opacity-100 group-focus-visible/item:opacity-100',
              )}
            >
              {formatChannelLabel(highlight.channel)}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className={classNames(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-tertiary transition-colors',
            isExpanded
              ? 'bg-surface-active text-text-primary'
              : 'group-hover/item:bg-surface-active group-hover/item:text-text-primary',
          )}
        >
          <ArrowIcon
            size={IconSize.XXSmall}
            className={classNames(
              'transition-transform duration-200 ease-out',
              isExpanded ? 'rotate-0' : 'rotate-180',
            )}
          />
        </span>
      </div>
    </div>
  );
};

interface HighlightStripItemProps {
  highlight: PostHighlight;
  index: number;
  isNew: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: (highlightId: string) => void;
  onHighlightClick?: (highlight: PostHighlight, position: number) => void;
  liRef?: (node: HTMLLIElement | null) => void;
}

const HighlightStripItem = ({
  highlight,
  index,
  isNew,
  isLast,
  isExpanded,
  onToggleExpand,
  onHighlightClick,
  liRef,
}: HighlightStripItemProps): ReactElement => {
  return (
    <li
      ref={liRef}
      className={classNames(
        'relative flex w-72 shrink-0 snap-start items-stretch laptop:w-80',
        isExpanded && 'invisible',
        isNew && 'animate-highlight-strip-enter',
      )}
    >
      <HighlightCardSurface
        highlight={highlight}
        isExpanded={false}
        variant="inline"
        onToggle={() => {
          onHighlightClick?.(highlight, index + 1);
          onToggleExpand(highlight.id);
        }}
      />
      {isNew && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 inline-flex animate-highlight-strip-flash items-center gap-1 rounded-6 bg-accent-ketchup-default px-1.5 py-px font-bold uppercase leading-none tracking-wider text-text-primary typo-caption2"
        >
          New
        </span>
      )}
      {!isLast && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-2.5 bottom-1.5 top-1.5 w-px bg-border-subtlest-tertiary"
        />
      )}
    </li>
  );
};

const HighlightStripSkeleton = (): ReactElement => (
  <section
    aria-busy
    aria-label="Loading highlights"
    className="relative w-full"
  >
    <div className="relative flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="relative flex items-stretch gap-2 px-2 py-2 laptop:px-3">
        <div className="hidden shrink-0 flex-col items-start justify-center gap-3 px-1 laptop:flex laptop:px-2">
          <ElementPlaceholder className="h-3 w-28 rounded-12" />
          <ElementPlaceholder className="h-3 w-16 rounded-12" />
        </div>
        <span
          aria-hidden
          className="my-1.5 hidden w-px shrink-0 self-stretch bg-border-subtlest-tertiary laptop:block"
        />
        <ol className="flex min-w-0 flex-1 items-stretch gap-5 overflow-hidden">
          {Array.from({ length: SKELETON_PLACEHOLDER_COUNT }).map(
            (_, index) => (
              <li
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="flex w-72 shrink-0 flex-col gap-2 rounded-10 border border-transparent px-3 py-2 laptop:w-80"
              >
                <ElementPlaceholder className="h-3 w-11/12 rounded-12" />
                <ElementPlaceholder className="h-3 w-9/12 rounded-12" />
                <ElementPlaceholder className="h-3 w-6/12 rounded-12" />
                <span className="mt-auto flex items-center gap-2">
                  <ElementPlaceholder className="h-2.5 w-12 rounded-12" />
                  <ElementPlaceholder className="ml-auto h-4 w-4 rounded-full" />
                </span>
              </li>
            ),
          )}
        </ol>
      </div>
      <div className="bg-border-subtlest-tertiary/30 h-0.5 w-full overflow-hidden">
        <span className="opacity-60 block h-full w-1/3 bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default" />
      </div>
    </div>
  </section>
);

const useUnseenHighlightCount = (
  highlights: PostHighlight[],
): { newCount: number; markAsSeen: () => void } => {
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(LAST_SEEN_STORAGE_KEY);
    if (stored) {
      setLastSeenAt(stored);
      return;
    }
    const now = new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_STORAGE_KEY, now);
    setLastSeenAt(now);
  }, []);

  const newCount = useMemo(() => {
    if (!lastSeenAt) {
      return 0;
    }
    const lastSeenMs = new Date(lastSeenAt).getTime();
    return highlights.filter(
      (highlight) => new Date(highlight.highlightedAt).getTime() > lastSeenMs,
    ).length;
  }, [highlights, lastSeenAt]);

  const markAsSeen = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const now = new Date().toISOString();
    window.localStorage.setItem(LAST_SEEN_STORAGE_KEY, now);
    setLastSeenAt(now);
  }, []);

  return { newCount, markAsSeen };
};

const useNewHighlightIds = (highlights: PostHighlight[]): Set<string> => {
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstRenderRef = useRef(true);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = highlights.map((highlight) => highlight.id);

    if (currentIds.length === 0) {
      return undefined;
    }

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      seenIdsRef.current = new Set(currentIds);
      return undefined;
    }

    const incoming = currentIds.filter((id) => !seenIdsRef.current.has(id));
    if (incoming.length === 0) {
      return undefined;
    }

    currentIds.forEach((id) => seenIdsRef.current.add(id));
    setNewIds((prev) => {
      const next = new Set(prev);
      incoming.forEach((id) => next.add(id));
      return next;
    });

    const timeout = window.setTimeout(() => {
      setNewIds((prev) => {
        if (incoming.every((id) => !prev.has(id))) {
          return prev;
        }
        const next = new Set(prev);
        incoming.forEach((id) => next.delete(id));
        return next;
      });
    }, NEW_HIGHLIGHT_ANIMATION_MS);

    return () => window.clearTimeout(timeout);
  }, [highlights]);

  return newIds;
};

const useScrollEdges = (
  scrollRef: React.RefObject<HTMLOListElement>,
  itemCount: number,
): {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  refresh: () => void;
} => {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const refresh = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollPrev(scrollLeft > SCROLL_EDGE_TOLERANCE_PX);
    setCanScrollNext(
      scrollLeft + clientWidth < scrollWidth - SCROLL_EDGE_TOLERANCE_PX,
    );
  }, [scrollRef]);

  useIsomorphicLayoutEffect(() => {
    refresh();
  }, [refresh, itemCount]);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || typeof window === 'undefined') {
      return undefined;
    }

    const handleScroll = (): void => refresh();
    node.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(refresh)
        : null;
    resizeObserver?.observe(node);
    window.addEventListener('resize', refresh);

    return () => {
      node.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', refresh);
    };
  }, [refresh, scrollRef]);

  return { canScrollPrev, canScrollNext, refresh };
};

const useAutoRotate = ({
  enabled,
  onTick,
}: {
  enabled: boolean;
  onTick: () => void;
}): {
  isPaused: boolean;
  pauseTemporarily: () => void;
  pauseHandlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: (event: React.FocusEvent<HTMLElement>) => void;
  };
} => {
  const [isHovering, setIsHovering] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [interactionPauseUntil, setInteractionPauseUntil] = useState(0);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const isPaused =
    !enabled ||
    isHovering ||
    isFocusedWithin ||
    Date.now() < interactionPauseUntil;

  useEffect(() => {
    if (!enabled || isHovering || isFocusedWithin) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      if (Date.now() < interactionPauseUntil) {
        return;
      }
      onTickRef.current();
    }, AUTO_ROTATE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [enabled, isHovering, isFocusedWithin, interactionPauseUntil]);

  const pauseTemporarily = useCallback(() => {
    setInteractionPauseUntil(Date.now() + RESUME_AFTER_INTERACTION_MS);
  }, []);

  const pauseHandlers = useMemo(
    () => ({
      onMouseEnter: () => setIsHovering(true),
      onMouseLeave: () => setIsHovering(false),
      onFocus: () => setIsFocusedWithin(true),
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocusedWithin(false);
        }
      },
    }),
    [],
  );

  return { isPaused, pauseTemporarily, pauseHandlers };
};

export const HighlightStrip = forwardRef(function HighlightStrip(
  {
    highlights,
    isLoading,
    onHighlightClick,
    onReadAllClick,
    className,
  }: HighlightStripProps,
  ref: Ref<HTMLElement>,
): ReactElement | null {
  const scrollRef = useRef<HTMLOListElement>(null);
  const newIds = useNewHighlightIds(highlights);
  const { newCount, markAsSeen } = useUnseenHighlightCount(highlights);
  const { canScrollPrev, canScrollNext } = useScrollEdges(
    scrollRef,
    highlights.length,
  );
  const [expandedHighlightId, setExpandedHighlightId] = useState<string | null>(
    null,
  );
  const [closingHighlightId, setClosingHighlightId] = useState<string | null>(
    null,
  );
  const closingTimeoutRef = useRef<number | null>(null);
  const [overlayRect, setOverlayRect] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  const cardRefsMap = useRef(new Map<string, HTMLLIElement>());
  const setCardRef = useCallback((id: string, node: HTMLLIElement | null) => {
    if (node) {
      cardRefsMap.current.set(id, node);
    } else {
      cardRefsMap.current.delete(id);
    }
  }, []);

  const overlayHighlightId = expandedHighlightId ?? closingHighlightId;
  const overlayHighlight = useMemo(
    () =>
      highlights.find((highlight) => highlight.id === overlayHighlightId) ??
      null,
    [highlights, overlayHighlightId],
  );

  const beginClose = useCallback((id: string) => {
    setClosingHighlightId(id);
    setExpandedHighlightId(null);
    if (closingTimeoutRef.current !== null) {
      window.clearTimeout(closingTimeoutRef.current);
    }
    closingTimeoutRef.current = window.setTimeout(() => {
      setClosingHighlightId(null);
      closingTimeoutRef.current = null;
    }, CLOSE_TRANSITION_MS);
  }, []);

  const handleToggleExpand = useCallback(
    (highlightId: string) => {
      if (expandedHighlightId === highlightId) {
        beginClose(highlightId);
        return;
      }
      if (closingTimeoutRef.current !== null) {
        window.clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = null;
      }
      setClosingHighlightId(null);
      setExpandedHighlightId(highlightId);
    },
    [beginClose, expandedHighlightId],
  );

  const handleCloseExpanded = useCallback(() => {
    if (expandedHighlightId) {
      beginClose(expandedHighlightId);
    }
  }, [beginClose, expandedHighlightId]);

  useEffect(
    () => () => {
      if (closingTimeoutRef.current !== null) {
        window.clearTimeout(closingTimeoutRef.current);
      }
    },
    [],
  );

  const firstHighlightId = highlights[0]?.id;
  const readAllHref = useMemo(
    () => getHighlightsUrl(firstHighlightId),
    [firstHighlightId],
  );

  const reducedMotion = useMemo(
    () => (typeof window === 'undefined' ? false : prefersReducedMotion()),
    [],
  );

  const advance = useCallback(
    (direction: 'prev' | 'next', loopToStartIfAtEnd = false) => {
      const node = scrollRef.current;
      if (!node) {
        return;
      }
      const amount = Math.max(node.clientWidth * 0.85, 260);

      if (
        direction === 'next' &&
        loopToStartIfAtEnd &&
        node.scrollLeft + node.clientWidth >=
          node.scrollWidth - SCROLL_EDGE_TOLERANCE_PX
      ) {
        node.scrollTo({ left: 0, behavior: 'smooth' });
        return;
      }

      node.scrollBy({
        left: direction === 'next' ? amount : -amount,
        behavior: 'smooth',
      });
    },
    [],
  );

  const enableAutoRotate =
    !reducedMotion && highlights.length > 1 && !overlayHighlight;
  const showProgressBar = !reducedMotion && highlights.length > 1;

  const { isPaused, pauseTemporarily, pauseHandlers } = useAutoRotate({
    enabled: enableAutoRotate,
    onTick: () => advance('next', true),
  });

  const handleManualAdvance = useCallback(
    (direction: 'prev' | 'next') => {
      pauseTemporarily();
      advance(direction);
    },
    [advance, pauseTemporarily],
  );

  const handleHighlightClick = useCallback(
    (highlight: PostHighlight, position: number) => {
      markAsSeen();
      onHighlightClick?.(highlight, position);
    },
    [markAsSeen, onHighlightClick],
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const setSectionRef = useCallback(
    (node: HTMLElement | null) => {
      sectionRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        // eslint-disable-next-line no-param-reassign
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [ref],
  );

  useIsomorphicLayoutEffect(() => {
    if (!overlayHighlightId) {
      setOverlayRect(null);
      return undefined;
    }
    let frame: number | null = null;
    const updatePosition = () => {
      const card = cardRefsMap.current.get(overlayHighlightId);
      if (!card) {
        return;
      }
      const cardRect = card.getBoundingClientRect();
      setOverlayRect({
        left: cardRect.left,
        top: cardRect.top,
        width: cardRect.width,
      });
    };
    const scheduleUpdate = () => {
      if (frame !== null) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = null;
        updatePosition();
      });
    };
    updatePosition();
    const scroll = scrollRef.current;
    scroll?.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('scroll', scheduleUpdate, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
      scroll?.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, { capture: true });
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [overlayHighlightId]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleManualAdvance('prev');
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleManualAdvance('next');
      }
    };
    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [handleManualAdvance]);

  useEffect(() => {
    if (!expandedHighlightId) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        beginClose(expandedHighlightId);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      const insideSection = sectionRef.current?.contains(target);
      const insidePanel = (target as HTMLElement).closest?.(
        '[data-highlight-strip-panel]',
      );
      if (insideSection || insidePanel) {
        return;
      }
      beginClose(expandedHighlightId);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [beginClose, expandedHighlightId]);

  if (highlights.length === 0) {
    if (isLoading) {
      return <HighlightStripSkeleton />;
    }
    return null;
  }

  return (
    <section
      ref={setSectionRef}
      data-testid="highlightItem"
      aria-label="Happening Now"
      className={classNames('group relative isolate w-full', className)}
      {...pauseHandlers}
    >
      <div className="relative flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="relative flex items-stretch gap-2 px-2 py-2 laptop:px-3">
          <div className="flex shrink-0 flex-col items-start justify-center gap-3 px-1 laptop:px-2">
            <span className="flex items-center gap-2">
              <span
                className={classNames(
                  highlightsTitleGradientClassName,
                  'whitespace-nowrap font-bold uppercase tracking-[0.08em] typo-footnote',
                )}
              >
                Happening Now
              </span>
              {newCount > 0 && (
                <span
                  aria-label={`${newCount} new since your last visit`}
                  className="bg-accent-ketchup-default/15 flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-bold uppercase leading-none tracking-wider text-accent-ketchup-default typo-caption2"
                >
                  <span
                    aria-hidden
                    className="h-1 w-1 animate-pulse rounded-full bg-accent-ketchup-default"
                  />
                  {newCount} new
                </span>
              )}
            </span>
            <div className="flex items-center justify-between gap-2">
              <Link href={readAllHref}>
                <a
                  href={readAllHref}
                  onClick={() => {
                    markAsSeen();
                    onReadAllClick?.();
                  }}
                  className="-ml-1 inline-flex items-center gap-0.5 rounded-6 px-1 font-bold text-text-tertiary outline-none transition-colors typo-caption1 hover:text-text-link focus-visible:text-text-link"
                >
                  View all
                  <ArrowIcon
                    size={IconSize.XXSmall}
                    className="rotate-90"
                    aria-hidden
                  />
                </a>
              </Link>
              <HighlightCardOptions />
            </div>
          </div>

          <span
            aria-hidden
            className="my-1.5 hidden w-px shrink-0 self-stretch bg-border-subtlest-tertiary laptop:block"
          />

          {canScrollPrev && (
            <Tooltip content="Previous">
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<ArrowIcon className="-rotate-90" />}
                aria-label="Previous highlights"
                onClick={() => handleManualAdvance('prev')}
                className="hidden shrink-0 self-center laptop:inline-flex"
              />
            </Tooltip>
          )}

          <div className="relative flex min-w-0 flex-1 items-stretch">
            <ol
              ref={scrollRef}
              className="no-scrollbar flex min-w-0 flex-1 snap-x snap-mandatory items-stretch gap-5 overflow-x-auto scroll-smooth"
              style={{
                scrollPaddingLeft: '0.5rem',
                WebkitMaskImage: buildScrollMask(canScrollPrev, canScrollNext),
                maskImage: buildScrollMask(canScrollPrev, canScrollNext),
              }}
            >
              {highlights.map((highlight, index) => (
                <HighlightStripItem
                  key={highlight.id}
                  highlight={highlight}
                  index={index}
                  isNew={newIds.has(highlight.id)}
                  isLast={index === highlights.length - 1}
                  isExpanded={overlayHighlightId === highlight.id}
                  onToggleExpand={handleToggleExpand}
                  onHighlightClick={handleHighlightClick}
                  liRef={(node) => setCardRef(highlight.id, node)}
                />
              ))}
            </ol>
          </div>

          {canScrollNext && (
            <Tooltip content="Next">
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                icon={<ArrowIcon className="rotate-90" />}
                aria-label="Next highlights"
                onClick={() => handleManualAdvance('next')}
                className="hidden shrink-0 self-center laptop:inline-flex"
              />
            </Tooltip>
          )}
        </div>

        {showProgressBar && (
          <div
            aria-hidden
            className="bg-border-subtlest-tertiary/30 relative h-0.5 overflow-hidden"
          >
            <span
              key={`progress-${
                enableAutoRotate && !isPaused ? 'running' : 'paused'
              }-${highlights.length}`}
              className={classNames(
                'absolute inset-y-0 left-0 w-full origin-left bg-gradient-to-r from-accent-blueCheese-default via-accent-cheese-default to-accent-avocado-default transition-opacity duration-300 ease-out',
                enableAutoRotate && !isPaused ? 'opacity-90' : 'opacity-40',
              )}
              style={{
                animation:
                  enableAutoRotate && !isPaused
                    ? `highlight-strip-progress ${AUTO_ROTATE_INTERVAL_MS}ms linear infinite`
                    : 'none',
              }}
            />
          </div>
        )}
      </div>

      {overlayHighlight && overlayRect && (
        <RootPortal>
          <div
            data-highlight-strip-panel="true"
            className="fixed z-[60]"
            role="region"
            aria-label="Highlight details"
            style={{
              left: overlayRect.left,
              top: overlayRect.top,
              width: overlayRect.width,
            }}
          >
            <HighlightCardSurface
              highlight={overlayHighlight}
              isExpanded={!!expandedHighlightId}
              variant="overlay"
              onToggle={handleCloseExpanded}
            />
          </div>
        </RootPortal>
      )}
    </section>
  );
});
