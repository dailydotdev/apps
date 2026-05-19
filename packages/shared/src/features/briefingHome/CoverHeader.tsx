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
  onReset: () => void;
}

export const CoverHeader = ({
  totals,
  sourceCount,
  onReset,
}: CoverHeaderProps): ReactElement => (
  <header
    id="brief-top"
    className="flex scroll-mt-20 flex-wrap items-end justify-between gap-x-4 gap-y-2"
  >
    <div className="flex flex-col gap-1">
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.LargeTitle}
        bold
        className="!leading-[1.05] tracking-[-0.02em]"
      >
        Your briefing is ready
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {totals.total} stories · ~{totals.readMinutes} min read · {sourceCount}{' '}
        sources scanned for you
      </Typography>
    </div>
    <div className="flex shrink-0 items-center gap-3">
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Quaternary}
        bold
      >
        {formatLongDate()}
      </Typography>
      {totals.readCount > 0 ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-8 px-1.5 py-1 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-tertiary"
        >
          <RefreshIcon size={IconSize.XXSmall} />
          <Typography type={TypographyType.Caption2} bold>
            Reset
          </Typography>
        </button>
      ) : null}
    </div>
  </header>
);
