import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  DevCardTheme,
  themeToLinearGradient,
} from '@dailydotdev/shared/src/components/profile/devcard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { TopReader } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';

export const BadgeRow = ({
  issuedAt,
  keyword,
}: Pick<TopReader, 'issuedAt' | 'keyword'>): ReactElement => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-12 bg-background-subtle p-3">
      <div className="flex min-w-0 flex-col">
        <Typography type={TypographyType.Subhead} bold className="truncate">
          {keyword.flags?.title || keyword.value}
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          {formatDate({
            value: issuedAt,
            type: TimeFormatType.TopReaderBadge,
          })}
        </Typography>
      </div>
      <span
        className="shrink-0 rounded-8 px-2 py-0.5"
        style={{ backgroundImage: themeToLinearGradient[DevCardTheme.Gold] }}
      >
        <Typography
          type={TypographyType.Subhead}
          bold
          className="whitespace-nowrap text-black"
        >
          Top reader
        </Typography>
      </span>
    </div>
  );
};

const Pane = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3 bg-background-default p-4">
    <Typography
      type={TypographyType.Subhead}
      color={TypographyColor.Tertiary}
      bold
    >
      {title}
    </Typography>
    {children}
  </div>
);

type BadgeTrophyCaseProps = {
  badges: ReactNode;
  awards: ReactNode;
};

export const BadgeTrophyCase = ({
  badges,
  awards,
}: BadgeTrophyCaseProps): ReactElement => {
  return (
    <div className="grid gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-border-subtlest-tertiary laptop:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <Pane title="Top reader badges">{badges}</Pane>
      <Pane title="Awards">{awards}</Pane>
    </div>
  );
};
