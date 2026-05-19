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
import { BriefIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { buildPersonalizedCategories } from '../../components/feeds/exploreCategories';
import { useFeedTagsList } from '../../hooks/useFeedTagsList';
import { useAuthContext } from '../../contexts/AuthContext';
import { briefCopy } from './copy';

interface BriefFloatingTabsProps {
  topId: string;
  feedId: string;
}

const STICKY_OFFSET = 56;

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
  topId,
  feedId,
}: BriefFloatingTabsProps): ReactElement => {
  const { isLoggedIn } = useAuthContext();
  const { tags } = useFeedTagsList({ enabled: isLoggedIn });
  const categories = useMemo(
    () => buildPersonalizedCategories(tags).slice(0, 16),
    [tags],
  );
  const barRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  const measure = useCallback(() => {
    rafRef.current = null;
    if (!barRef.current) {
      return;
    }
    const { top } = barRef.current.getBoundingClientRect();
    setIsStuck(top <= STICKY_OFFSET + 1);
  }, []);

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

  const onBrief = useCallback(() => scrollToId(topId), [topId]);
  const onForYou = useCallback(() => scrollToId(feedId), [feedId]);

  return (
    <div
      ref={barRef}
      className="z-30 sticky mb-3"
      style={{ top: `${STICKY_OFFSET}px` }}
    >
      <div
        className={classNames(
          'flex items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default transition-shadow',
          isStuck && 'shadow-2',
        )}
      >
        <div className="flex shrink-0 items-center gap-1 p-1">
          <button
            type="button"
            onClick={onBrief}
            aria-current={!isStuck ? 'page' : undefined}
            className={classNames(
              'inline-flex items-center gap-1.5 rounded-8 px-3 py-1.5 transition-colors',
              !isStuck
                ? 'bg-text-primary text-surface-invert'
                : 'text-text-tertiary hover:bg-surface-float',
            )}
          >
            <BriefIcon
              size={IconSize.XSmall}
              secondary
              className={!isStuck ? '' : 'text-accent-ketchup-default'}
            />
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.tabBriefing}
            </Typography>
          </button>
          <button
            type="button"
            onClick={onForYou}
            aria-current={isStuck ? 'page' : undefined}
            className={classNames(
              'inline-flex items-center gap-1.5 rounded-8 px-3 py-1.5 transition-colors',
              isStuck
                ? 'bg-text-primary text-surface-invert'
                : 'text-text-tertiary hover:bg-surface-float',
            )}
          >
            <Typography type={TypographyType.Footnote} bold>
              {briefCopy.tabFeed}
            </Typography>
          </button>
        </div>
        <div
          aria-hidden={!isStuck}
          className={classNames(
            'flex min-w-0 items-center transition-[max-width,opacity,padding] duration-300 ease-out',
            isStuck
              ? 'max-w-full flex-1 pl-2 pr-1 opacity-100'
              : 'pointer-events-none max-w-0 opacity-0',
          )}
        >
          <span
            aria-hidden
            className="mr-2 h-5 w-px shrink-0 bg-border-subtlest-tertiary"
          />
          <ul className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1.5">
            {categories.map((cat) => (
              <li key={cat.id} className="shrink-0">
                <a
                  href={cat.path}
                  className="inline-flex h-7 items-center rounded-8 px-2.5 transition-colors hover:bg-surface-float"
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
        </div>
      </div>
    </div>
  );
};
