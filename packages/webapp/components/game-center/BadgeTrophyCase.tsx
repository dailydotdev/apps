import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ArrowIcon,
  MedalBadgeIcon,
} from '@dailydotdev/shared/src/components/icons';
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
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

export const BadgeRow = ({
  issuedAt,
  keyword,
  image,
}: Pick<TopReader, 'issuedAt' | 'keyword' | 'image'>): ReactElement => {
  const title = keyword.flags?.title || keyword.value;

  return (
    <div className="flex items-center gap-3 rounded-12 bg-background-default p-3">
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
          className="flex items-center gap-1 whitespace-nowrap text-black"
        >
          <MedalBadgeIcon size={IconSize.Size16} />
          Top reader
        </Typography>
      </span>
    </div>
  );
};

export const badgePageSize = 4;

type BadgePagerProps = {
  badges: TopReader[];
};

export const BadgePager = ({ badges }: BadgePagerProps): ReactElement => {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(badges.length / badgePageSize);
  const start = page * badgePageSize;
  const visible = badges.slice(start, start + badgePageSize);

  return (
    <div className="flex flex-col gap-2">
      {visible.map((badge) => (
        <BadgeRow
          key={badge.id}
          issuedAt={badge.issuedAt}
          keyword={badge.keyword}
          image={badge.image}
        />
      ))}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="tabular-nums"
          >
            {start + 1}-{start + visible.length} of {badges.length}
          </Typography>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="-rotate-90" />}
              aria-label="Previous badges"
              disabled={page === 0}
              onClick={() => setPage((current) => current - 1)}
            />
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="rotate-90" />}
              aria-label="Next badges"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((current) => current + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

type PaneStat = {
  label: string;
  value: string;
  icon?: ReactNode;
};

const Pane = ({
  stats,
  children,
}: {
  stats: PaneStat[];
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3 rounded-14 bg-background-subtle p-4">
    {children}
    {/* Reads as one line under the content, matching the HUD stats. */}
    <div className="mt-auto flex flex-wrap items-baseline gap-x-5 gap-y-1 pt-1">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-1.5">
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="truncate"
          >
            {stat.label}
          </Typography>
          {stat.icon}
          <Typography
            type={TypographyType.Callout}
            bold
            className="tabular-nums"
          >
            {stat.value}
          </Typography>
        </div>
      ))}
    </div>
  </div>
);

type BadgeTrophyCaseProps = {
  badges: ReactNode;
  badgeStats: PaneStat[];
  awards: ReactNode;
  awardStats: PaneStat[];
};

export const BadgeTrophyCase = ({
  badges,
  badgeStats,
  awards,
  awardStats,
}: BadgeTrophyCaseProps): ReactElement => {
  return (
    <div className="grid gap-2 rounded-20 border border-border-subtlest-tertiary p-2 laptop:grid-cols-2">
      <Pane stats={badgeStats}>{badges}</Pane>
      <Pane stats={awardStats}>{awards}</Pane>
    </div>
  );
};
