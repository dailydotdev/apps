import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { BriefIcon, HomeIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { buildPersonalizedCategories } from '../../components/feeds/exploreCategories';
import { useFeedTagsList } from '../../hooks/useFeedTagsList';
import { useAuthContext } from '../../contexts/AuthContext';
import { briefCopy } from './copy';

interface BriefFloatingTabsProps {
  topId: string;
  feedId: string;
  sentinelId: string;
}

const HEADER_OFFSET = 56;
const BOTTOM_GAP = 24;
const BAR_HEIGHT = 48;
const TABS_WIDTH_FALLBACK = 220;
const VIEWPORT_PADDING = 24;

const scrollToId = (id: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const Tab = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={classNames(
      'inline-flex h-9 items-center gap-1.5 rounded-8 px-3 transition-colors',
      active
        ? 'bg-text-primary text-surface-invert'
        : 'text-text-tertiary hover:bg-surface-float',
    )}
  >
    {children}
  </button>
);

export const BriefFloatingTabs = ({
  topId,
  feedId,
  sentinelId,
}: BriefFloatingTabsProps): ReactElement | null => {
  const { isLoggedIn } = useAuthContext();
  const { tags } = useFeedTagsList({ enabled: isLoggedIn });
  const categories = useMemo(() => buildPersonalizedCategories(tags), [tags]);
  const [mounted, setMounted] = useState(false);
  const [{ barTop, isDocked, feedLeft, feedWidth, viewportW }, setLayout] =
    useState({
      barTop: 0,
      isDocked: false,
      feedLeft: 0,
      feedWidth: 0,
      viewportW: 1024,
    });
  const [tabsWidth, setTabsWidth] = useState(TABS_WIDTH_FALLBACK);
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !tabsRowRef.current) {
      return undefined;
    }
    const node = tabsRowRef.current;
    const update = () => {
      const w = node.offsetWidth;
      if (w > 0) {
        setTabsWidth(w);
      }
    };
    update();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, [mounted]);

  const measure = useCallback(() => {
    rafRef.current = null;
    if (typeof window === 'undefined') {
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const floatingTop = vh - BAR_HEIGHT - BOTTOM_GAP;
    const sentinel = document.getElementById(sentinelId);
    let nextTop = floatingTop;
    let nextFeedLeft = (vw - Math.min(1024, vw - VIEWPORT_PADDING)) / 2;
    let nextFeedWidth = Math.min(1024, vw - VIEWPORT_PADDING);
    if (sentinel) {
      const rect = sentinel.getBoundingClientRect();
      const followTop = rect.top - BAR_HEIGHT;
      nextTop = Math.max(HEADER_OFFSET, Math.min(floatingTop, followTop));
      if (rect.width > 0) {
        nextFeedLeft = rect.left;
        nextFeedWidth = rect.width;
      }
    }
    const nextDocked = nextTop <= HEADER_OFFSET;
    setLayout((prev) => {
      if (
        prev.barTop === nextTop &&
        prev.isDocked === nextDocked &&
        prev.feedLeft === nextFeedLeft &&
        prev.feedWidth === nextFeedWidth &&
        prev.viewportW === vw
      ) {
        return prev;
      }
      return {
        barTop: nextTop,
        isDocked: nextDocked,
        feedLeft: nextFeedLeft,
        feedWidth: nextFeedWidth,
        viewportW: vw,
      };
    });
  }, [sentinelId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const onScroll = () => {
      if (rafRef.current != null) {
        return;
      }
      rafRef.current = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [measure]);

  const goBrief = useCallback(() => scrollToId(topId), [topId]);
  const goFeed = useCallback(() => scrollToId(feedId), [feedId]);

  if (!mounted) {
    return null;
  }

  const dockedWidth = feedWidth || viewportW - VIEWPORT_PADDING;
  const widthPx = isDocked ? dockedWidth : tabsWidth;
  const centerX = (feedLeft || 0) + (feedWidth || 0) / 2;

  return createPortal(
    <div
      style={{
        top: `${barTop}px`,
        left: `${centerX}px`,
        width: `${widthPx}px`,
      }}
      className="fixed z-popup -translate-x-1/2 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div
        className={classNames(
          'flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default transition-shadow duration-500',
          isDocked ? 'shadow-2' : 'shadow-3',
        )}
      >
        <div ref={tabsRowRef} className="flex shrink-0 items-center gap-1 p-1">
          <Tab active={!isDocked} onClick={goBrief}>
            <BriefIcon
              size={IconSize.XSmall}
              secondary
              className={!isDocked ? '' : 'text-accent-ketchup-default'}
            />
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.tabBriefing}
            </Typography>
          </Tab>
          <Tab active={isDocked} onClick={goFeed}>
            <HomeIcon size={IconSize.XSmall} secondary />
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.tabFeed}
            </Typography>
          </Tab>
        </div>
        <div
          aria-hidden={!isDocked}
          className={classNames(
            'flex min-w-0 items-center transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            isDocked
              ? 'max-w-full flex-1 opacity-100'
              : 'pointer-events-none max-w-0 opacity-0',
          )}
        >
          <span
            aria-hidden
            className="mr-1 h-5 w-px shrink-0 bg-border-subtlest-tertiary"
          />
          {categories.length > 0 ? (
            <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pr-2">
              {categories.map((cat) => (
                <li key={cat.id} className="shrink-0">
                  <a
                    href={cat.path}
                    className="inline-flex h-8 items-center rounded-8 px-2.5 transition-colors hover:bg-surface-float"
                  >
                    <Typography
                      type={TypographyType.Footnote}
                      color={TypographyColor.Tertiary}
                    >
                      {cat.label}
                    </Typography>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
};
