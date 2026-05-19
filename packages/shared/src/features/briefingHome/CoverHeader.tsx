import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { RefreshIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';

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
}: CoverHeaderProps): ReactElement => (
  <header id="brief-top" className="flex scroll-mt-20 flex-col gap-2">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="!leading-[1.05] tracking-[-0.02em]"
      >
        Your briefing is ready
      </Typography>
      <div className="flex shrink-0 items-center gap-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {formatLongDate()}
        </Typography>
        {totals.readCount > 0 ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 rounded-8 px-1.5 py-1 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-tertiary"
            aria-label="Reset read progress"
          >
            <RefreshIcon size={IconSize.XXSmall} />
            <Typography type={TypographyType.Caption2} bold>
              Reset
            </Typography>
          </button>
        ) : null}
      </div>
    </div>
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
      <span className="font-bold text-text-primary">{sourceCount} sources</span>{' '}
      you follow today.{' '}
      <span className="text-text-tertiary">
        Here are the{' '}
        <span className="font-bold text-text-primary">{totals.total}</span> that
        actually matter.
      </span>
    </Typography>
  </header>
);
