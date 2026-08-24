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
import { Image } from '@dailydotdev/shared/src/components/image/Image';
import type { TopReader } from '@dailydotdev/shared/src/components/badges/TopReaderBadge';
import {
  formatDate,
  TimeFormatType,
} from '@dailydotdev/shared/src/lib/dateFormat';

// Frosted glass, matching the level badge: a translucent wash and a lit
// top edge rather than a flat fill.
const badgeRowStyle = {
  background:
    'linear-gradient(145deg, rgba(255,255,255,0.55), rgba(255,255,255,0.16))',
  border: '1px solid rgba(255,255,255,0.35)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 14px -6px rgba(0,0,0,0.35)',
  padding: '0.75rem',
};

export const BadgeRow = ({
  issuedAt,
  keyword,
  image,
}: Pick<TopReader, 'issuedAt' | 'keyword' | 'image'>): ReactElement => {
  const title = keyword.flags?.title || keyword.value;

  return (
    <div
      className="flex items-center gap-3 rounded-12 backdrop-blur-[6px]"
      style={badgeRowStyle}
    >
      {image ? (
        <Image
          src={image}
          alt={`${title} badge`}
          className="size-8 shrink-0 rounded-8 object-cover"
          loading="lazy"
        />
      ) : (
        // The keyword carries no artwork of its own, so an initial stands in.
        <span className="grid size-8 shrink-0 place-items-center rounded-8 bg-background-subtle font-bold text-text-tertiary typo-subhead">
          {title.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Typography type={TypographyType.Subhead} bold className="truncate">
          {title}
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
  value,
  label,
  children,
}: {
  value: string;
  label: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-14 bg-background-subtle p-4">
    <div className="flex min-w-0 flex-col">
      <Typography
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
        className="truncate"
      >
        {label}
      </Typography>
      <Typography type={TypographyType.Title2} bold className="tabular-nums">
        {value}
      </Typography>
    </div>
    {children}
  </div>
);

type BadgeTrophyCaseProps = {
  badges: ReactNode;
  badgeCount: string;
  awards: ReactNode;
  awardCount: string;
};

export const BadgeTrophyCase = ({
  badges,
  badgeCount,
  awards,
  awardCount,
}: BadgeTrophyCaseProps): ReactElement => {
  return (
    <div className="grid gap-2 rounded-20 border border-border-subtlest-tertiary p-2 laptop:grid-cols-2">
      <Pane value={badgeCount} label="Topics mastered">
        {badges}
      </Pane>
      <Pane value={awardCount} label="Total awards">
        {awards}
      </Pane>
    </div>
  );
};
