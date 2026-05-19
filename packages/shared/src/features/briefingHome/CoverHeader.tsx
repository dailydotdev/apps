import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import {
  RefreshIcon,
  MagicIcon,
  TimerIcon,
  DiscussIcon,
} from '../../components/icons';
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

const StatChip = ({
  icon,
  value,
  label,
}: {
  icon: ReactElement;
  value: string;
  label: string;
}): ReactElement => (
  <div className="flex items-center gap-2.5 rounded-10 border border-border-subtlest-quaternary bg-surface-float px-3 py-2">
    <span className="flex size-7 shrink-0 items-center justify-center rounded-8 bg-background-default text-brand-default">
      {icon}
    </span>
    <div className="flex flex-col leading-none">
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Primary}
        bold
        className="tabular-nums"
      >
        {value}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
        className="mt-0.5"
      >
        {label}
      </Typography>
    </div>
  </div>
);

export const CoverHeader = ({
  totals,
  sourceCount,
  scannedCount,
  onReset,
}: CoverHeaderProps): ReactElement => (
  <header id="brief-top" className="flex scroll-mt-20 flex-col gap-4">
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

    <div className="flex flex-col gap-2.5 rounded-14 border border-border-subtlest-quaternary bg-background-subtle p-4">
      <div className="flex items-center gap-2">
        <MagicIcon
          size={IconSize.XSmall}
          className="text-brand-default"
          secondary
        />
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="!leading-snug"
        >
          We scanned{' '}
          <span className="font-bold text-text-primary">
            {scannedCount.toLocaleString()} posts
          </span>{' '}
          across{' '}
          <span className="font-bold text-text-primary">
            {sourceCount} sources
          </span>{' '}
          you follow and distilled the{' '}
          <span className="font-bold text-text-primary">
            {totals.total} that actually matter
          </span>{' '}
          today.
        </Typography>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatChip
          icon={<TimerIcon size={IconSize.XSmall} secondary />}
          value={`${totals.readMinutes} min`}
          label="to read it all"
        />
        <StatChip
          icon={<DiscussIcon size={IconSize.XSmall} secondary />}
          value={`${scannedCount.toLocaleString()}`}
          label="posts analyzed"
        />
        <StatChip
          icon={<MagicIcon size={IconSize.XSmall} secondary />}
          value={`${totals.total}`}
          label="curated for you"
        />
      </div>
    </div>
  </header>
);
