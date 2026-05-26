import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { RefreshIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';

const INTRO_SEEN_KEY = 'daily.brief.intro-seen';

const todayKey = (): string => new Date().toISOString().slice(0, 10);

const useIsFirstVisitToday = (): boolean => {
  const [isFirst, setIsFirst] = useState(true);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(INTRO_SEEN_KEY);
      const today = todayKey();
      if (seen === today) {
        setIsFirst(false);
        return;
      }
      window.localStorage.setItem(INTRO_SEEN_KEY, today);
    } catch {
      /* storage blocked */
    }
  }, []);

  return isFirst;
};

const formatLongDate = (): string =>
  new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

interface CoverHeaderProps {
  totals: {
    total: number;
    readMinutes: number;
    readCount: number;
  };
  sourceCount: number;
  scannedCount: number;
  onReset: () => void;
}

export const CoverHeader = ({
  totals,
  sourceCount,
  scannedCount,
  onReset,
}: CoverHeaderProps): ReactElement => {
  const isFirstVisit = useIsFirstVisitToday();
  const compactStats = `${scannedCount.toLocaleString()} scanned · ${
    totals.total
  } stories · ${totals.readMinutes} min`;

  return (
    <header id="brief-top" className="flex scroll-mt-20 flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Typography
          tag={TypographyTag.H1}
          type={TypographyType.LargeTitle}
          bold
          className="!leading-[1.05] tracking-[-0.02em]"
        >
          Today&apos;s read
        </Typography>
        <div className="flex shrink-0 items-center gap-3">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {formatLongDate()}
          </Typography>
          <button
            type="button"
            onClick={onReset}
            className={classNames(
              'inline-flex items-center gap-1 rounded-8 px-1.5 py-1 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-tertiary',
              totals.readCount === 0 && 'pointer-events-none invisible',
            )}
            aria-label="Reset read progress"
            aria-hidden={totals.readCount === 0}
            tabIndex={totals.readCount === 0 ? -1 : 0}
          >
            <RefreshIcon size={IconSize.XXSmall} />
            <Typography type={TypographyType.Caption2} bold>
              Reset
            </Typography>
          </button>
        </div>
      </div>
      {isFirstVisit ? (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
          className="!leading-snug"
        >
          We read{' '}
          <span className="font-bold text-text-primary">
            {scannedCount.toLocaleString()} posts
          </span>{' '}
          from{' '}
          <span className="font-bold text-text-primary">
            {sourceCount} sources
          </span>{' '}
          you follow today.{' '}
          <span className="text-text-tertiary">
            Here are the{' '}
            <span className="font-bold text-text-primary">{totals.total}</span>{' '}
            that actually matter.
          </span>
        </Typography>
      ) : (
        <Typography
          tag={TypographyTag.P}
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="tabular-nums"
        >
          {compactStats}
        </Typography>
      )}
    </header>
  );
};
