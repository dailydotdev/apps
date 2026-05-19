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
import { BriefIcon } from '../../components/icons';
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
const TABS_WIDTH = 220;
const DOCKED_MAX_WIDTH = 1024;
const VIEWPORT_PADDING = 24;
const SCROLL_LOCK_MS = 700;

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
  const [isDocked, setIsDocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewport, setViewport] = useState({ w: 1024, h: 800 });
  const rafRef = useRef<number | null>(null);
  const scrollLockUntilRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    }
  }, []);

  const measure = useCallback(() => {
    rafRef.current = null;
    if (typeof window === 'undefined') {
      return;
    }
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    if (Date.now() < scrollLockUntilRef.current) {
      return;
    }
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) {
      return;
    }
    const { top } = sentinel.getBoundingClientRect();
    setIsDocked(top <= HEADER_OFFSET);
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

  const goBrief = useCallback(() => {
    scrollLockUntilRef.current = Date.now() + SCROLL_LOCK_MS;
    setIsDocked(false);
    scrollToId(topId);
  }, [topId]);

  const goFeed = useCallback(() => {
    scrollLockUntilRef.current = Date.now() + SCROLL_LOCK_MS;
    setIsDocked(true);
    scrollToId(feedId);
  }, [feedId]);

  if (!mounted) {
    return null;
  }

  const topPx = isDocked ? HEADER_OFFSET : viewport.h - BAR_HEIGHT - BOTTOM_GAP;
  const widthPx = isDocked
    ? Math.min(DOCKED_MAX_WIDTH, viewport.w - VIEWPORT_PADDING)
    : TABS_WIDTH;

  return createPortal(
    <div
      style={{ top: `${topPx}px`, width: `${widthPx}px` }}
      className="fixed left-1/2 z-popup -translate-x-1/2 transition-[top,width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div
        className={classNames(
          'flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default transition-shadow duration-500',
          isDocked ? 'shadow-2' : 'shadow-3',
        )}
      >
        <div className="flex shrink-0 items-center gap-1 p-1">
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
            className="mx-1 h-6 w-px shrink-0 bg-border-subtlest-tertiary"
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
