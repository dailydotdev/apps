import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { BriefIcon, ArrowIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { ExploreChipsBar } from '../../components/feeds/ExploreChipsBar';
import { buildPersonalizedCategories } from '../../components/feeds/exploreCategories';
import { useFeedTagsList } from '../../hooks/useFeedTagsList';
import { useAuthContext } from '../../contexts/AuthContext';
import { briefCopy } from './copy';

interface BriefFloatingTabsProps {
  sentinelId: string;
  topId: string;
}

const HEADER_OFFSET = 64;

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

export const BriefFloatingTabs = ({
  sentinelId,
  topId,
}: BriefFloatingTabsProps): ReactElement => {
  const { isLoggedIn } = useAuthContext();
  const { tags } = useFeedTagsList({ enabled: isLoggedIn });
  const categories = useMemo(() => buildPersonalizedCategories(tags), [tags]);
  const [isDocked, setIsDocked] = useState(false);
  const rafRef = useRef<number | null>(null);

  const measure = useCallback(() => {
    rafRef.current = null;
    if (typeof document === 'undefined') {
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

  const onForYou = useCallback(() => scrollToId(sentinelId), [sentinelId]);
  const onBriefBack = useCallback(() => scrollToId(topId), [topId]);

  return (
    <>
      <div
        aria-hidden={isDocked}
        className={classNames(
          'z-40 fixed bottom-5 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out',
          isDocked
            ? 'pointer-events-none translate-y-3 opacity-0'
            : 'pointer-events-auto opacity-100',
        )}
      >
        <div className="bg-background-popover/95 inline-flex items-center gap-1 rounded-full border border-border-subtlest-tertiary p-1 shadow-3 backdrop-blur">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-text-primary px-3 py-1.5 text-surface-invert"
            aria-current="page"
          >
            <BriefIcon size={IconSize.XSmall} secondary />
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.tabBriefing}
            </Typography>
          </span>
          <button
            type="button"
            onClick={onForYou}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors hover:bg-surface-float"
          >
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              bold
            >
              {briefCopy.tabFeed}
            </Typography>
            <ArrowIcon
              size={IconSize.XXSmall}
              className="rotate-180 text-text-quaternary"
            />
          </button>
        </div>
      </div>

      <div
        aria-hidden={!isDocked}
        className={classNames(
          'z-40 fixed left-1/2 top-14 w-[min(64rem,calc(100vw-1.5rem))] -translate-x-1/2 transition-all duration-300 ease-out',
          isDocked
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0',
        )}
      >
        <div className="bg-background-default/95 flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary px-3 py-2 shadow-3 backdrop-blur">
          <button
            type="button"
            onClick={onBriefBack}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-10 border border-border-subtlest-tertiary bg-background-subtle px-3 py-1.5 transition-colors hover:bg-surface-float"
          >
            <ArrowIcon
              size={IconSize.XXSmall}
              className="text-text-tertiary group-hover:text-text-primary"
            />
            <BriefIcon
              size={IconSize.XSmall}
              className="text-accent-ketchup-default"
              secondary
            />
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Primary}
              bold
            >
              {briefCopy.tabBriefing}
            </Typography>
          </button>
          <span
            aria-hidden
            className="h-6 w-px shrink-0 bg-border-subtlest-tertiary"
          />
          <div className="min-w-0 flex-1">
            <ExploreChipsBar categories={categories} />
          </div>
        </div>
      </div>
    </>
  );
};
