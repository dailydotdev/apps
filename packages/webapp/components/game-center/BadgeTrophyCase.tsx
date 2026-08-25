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
    <div className="flex flex-1 flex-col gap-2">
      {visible.map((badge) => (
        <BadgeRow
          key={badge.id}
          issuedAt={badge.issuedAt}
          keyword={badge.keyword}
          image={badge.image}
        />
      ))}

      {/* A short last page would otherwise change the column's height and
          shift everything below it. */}
      {Array.from({ length: badgePageSize - visible.length }, (_, index) => (
        <div
          key={`filler-${index.toString()}`}
          className="invisible"
          aria-hidden
        >
          <BadgeRow
            issuedAt={visible[0].issuedAt}
            keyword={visible[0].keyword}
          />
        </div>
      ))}

      {pageCount > 1 && (
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
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

// A faint gold wash and a glint above it, giving the top reader pane the
// vibe of the gold chips it holds.
const goldPaneStyle = {
  backgroundImage: [
    'radial-gradient(120% 90% at 78% 8%, rgba(255,214,102,0.20), transparent 62%)',
    'radial-gradient(80% 70% at 12% 96%, rgba(214,158,46,0.14), transparent 58%)',
    'repeating-linear-gradient(122deg, rgba(255,214,102,0.05) 0 1px, transparent 1px 16px)',
  ].join(', '),
};

const Pane = ({
  stats,
  children,
  isGold,
}: {
  stats: PaneStat[];
  children: ReactNode;
  isGold?: boolean;
}): ReactElement => (
  <div
    className="flex flex-col gap-3 rounded-14 bg-background-subtle p-4"
    style={isGold ? goldPaneStyle : undefined}
  >
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
      <Pane stats={badgeStats} isGold>
        {badges}
      </Pane>
      <Pane stats={awardStats}>{awards}</Pane>
    </div>
  );
};
