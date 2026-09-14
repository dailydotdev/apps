import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
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
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
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

// The floor for a page. The awards pane beside this one is usually taller, so
// the real page size is whatever that leftover height fits.
export const badgePageSize = 4;

const badgeRowGap = 8;

type BadgePagerProps = {
  badges: TopReader[];
};

export const BadgePager = ({ badges }: BadgePagerProps): ReactElement => {
  const isMobile = useViewSize(ViewSize.MobileL);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(badgePageSize);
  const listRef = useRef<HTMLDivElement>(null);

  // The pane's height comes from its taller sibling, so how many rows belong
  // on a page is only knowable once it has been laid out.
  const measure = useCallback(() => {
    const list = listRef.current;
    const row = list?.firstElementChild as HTMLElement | null;

    if (!list || !row) {
      return;
    }

    const rowHeight = row.offsetHeight + badgeRowGap;
    const fits = Math.floor((list.clientHeight + badgeRowGap) / rowHeight);

    setPerPage(Math.max(badgePageSize, Math.min(fits, badges.length)));
  }, [badges.length]);

  // Measured before paint so the first render already fills, then observed
  // because the awards pane grows again as its images arrive.
  useLayoutEffect(() => {
    const list = listRef.current;

    if (!list) {
      return undefined;
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(list);

    return () => observer.disconnect();
  }, [measure]);

  const pageCount = Math.ceil(badges.length / perPage);
  const boundedPage = Math.min(page, Math.max(pageCount - 1, 0));
  const start = boundedPage * perPage;
  const visible = badges.slice(start, start + perPage);

  // A phone swipes between the same pages the arrows step through, so the
  // pane keeps its height and the thumb replaces a 32px target.
  if (isMobile) {
    const pages = Array.from({ length: pageCount }, (_, index) =>
      badges.slice(index * perPage, index * perPage + perPage),
    );

    return (
      <div className="flex flex-1 flex-col gap-2">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          onScroll={(event) => {
            const track = event.currentTarget;
            setPage(Math.round(track.scrollLeft / track.clientWidth));
          }}
        >
          {pages.map((rows, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`badge-page-${index}`}
              className="flex w-full shrink-0 snap-start flex-col gap-2"
            >
              {rows.map((badge) => (
                <BadgeRow
                  key={badge.id}
                  issuedAt={badge.issuedAt}
                  keyword={badge.keyword}
                  image={badge.image}
                />
              ))}

              {/* A short last page would otherwise shorten the whole pane. */}
              {Array.from({ length: perPage - rows.length }, (_, filler) => (
                <div
                  key={`filler-${filler.toString()}`}
                  className="invisible"
                  aria-hidden
                >
                  <BadgeRow
                    issuedAt={rows[0].issuedAt}
                    keyword={rows[0].keyword}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <Typography
            type={TypographyType.Subhead}
            color={TypographyColor.Tertiary}
            className="mt-auto pt-1 tabular-nums"
          >
            {start + 1}-{start + visible.length} of {badges.length}
          </Typography>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div ref={listRef} className="flex flex-1 flex-col gap-2 overflow-hidden">
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
        {Array.from({ length: perPage - visible.length }, (_, index) => (
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
      </div>

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
              disabled={boundedPage === 0}
              onClick={() => setPage(boundedPage - 1)}
            />
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.Small}
              icon={<ArrowIcon className="rotate-90" />}
              aria-label="Next badges"
              disabled={boundedPage >= pageCount - 1}
              onClick={() => setPage(boundedPage + 1)}
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
    // min-w-0 because a grid item will not shrink past its own content,
    // and the rows inside are wider than a narrow phone.
    className="flex min-w-0 flex-col gap-3 rounded-14 bg-background-subtle p-4"
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
