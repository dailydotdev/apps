import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';

interface DateParts {
  month: string;
  day: string;
  weekday: string;
}

const formatDateParts = (): DateParts => {
  const now = new Date();
  return {
    month: now.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    day: now.toLocaleDateString(undefined, { day: 'numeric' }),
    weekday: now.toLocaleDateString(undefined, { weekday: 'short' }),
  };
};

const DateWidget = (): ReactElement => {
  const { month, day, weekday } = formatDateParts();

  return (
    <div
      aria-label={`${weekday}, ${month} ${day}`}
      className="flex w-16 shrink-0 flex-col items-stretch overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-default text-center"
    >
      <div className="bg-accent-cabbage-default px-2 py-0.5">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          bold
          color={TypographyColor.Primary}
          className="tracking-wide text-surface-invert"
        >
          {month}
        </Typography>
      </div>
      <div className="flex flex-col items-center gap-0.5 px-2 pb-1 pt-0.5">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Title2}
          bold
          color={TypographyColor.Primary}
          className="tabular-nums !leading-none"
        >
          {day}
        </Typography>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption2}
          color={TypographyColor.Tertiary}
        >
          {weekday}
        </Typography>
      </div>
    </div>
  );
};

export const CoverHeader = (): ReactElement => (
  <header
    id="daily-top"
    className="flex scroll-mt-20 flex-wrap items-center justify-between gap-x-4 gap-y-3"
  >
    <Typography
      tag={TypographyTag.H1}
      type={TypographyType.LargeTitle}
      bold
      className="!leading-[1.05] tracking-[-0.02em]"
    >
      Your daily
    </Typography>
    <DateWidget />
  </header>
);
