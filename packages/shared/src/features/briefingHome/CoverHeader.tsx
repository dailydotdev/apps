import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';

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
}

export const CoverHeader = ({
  totals,
  sourceCount,
}: CoverHeaderProps): ReactElement => (
  <header id="brief-top" className="flex scroll-mt-20 flex-col gap-3">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
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
        {formatLongDate()}
      </Typography>
    </div>
    <Typography
      tag={TypographyTag.P}
      type={TypographyType.Callout}
      color={TypographyColor.Secondary}
      className="!leading-snug"
    >
      <span className="font-bold text-text-primary">
        {totals.total} stories
      </span>{' '}
      ·{' '}
      <span className="font-bold text-text-primary">
        ~{totals.readMinutes} min read
      </span>{' '}
      ·{' '}
      <span className="font-bold text-text-primary">{sourceCount} sources</span>{' '}
      scanned for you
    </Typography>
  </header>
);
