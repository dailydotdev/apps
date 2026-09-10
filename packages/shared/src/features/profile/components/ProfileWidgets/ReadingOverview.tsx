import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  UserReadHistory,
  UserStreak,
  MostReadTag,
} from '../../../../graphql/users';
import { sumReadHistory } from '../../../../graphql/users';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import {
  CalendarHeatmap,
  getBin,
  getBins,
} from '../../../../components/CalendarHeatmap';
import { migrateUserToStreaks } from '../../../../lib/constants';
import { ClickableText } from '../../../../components/buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import {
  ReadingStreaksSection,
  ReadingTagsSection,
  HeatmapLegend,
  ReadingOverviewSkeleton,
} from './ReadingOverviewComponents';
import { anchorDefaultRel, pluralize } from '../../../../lib/strings';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { ReadingOverviewSnapshotCard } from '../../../snapshot/ReadingOverviewSnapshotCard';
import { ProfileSnapshotButton } from '../../../snapshot/ProfileSnapshotButton';
import { tagTitlesQueryOptions } from '../../../../graphql/keywords';
import type { PublicProfile } from '../../../../lib/user';
import { Origin } from '../../../../lib/log';

/** ReadingOverviewSnapshotCard's heatmap grid: four rows of twenty-two. */
const SNAPSHOT_HEATMAP_CELLS = 88;

// Utility functions
const readHistoryToValue = (value: UserReadHistory): number => value.reads;

const readHistoryToTooltip = (
  value: UserReadHistory,
  date: Date,
): ReactNode => {
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  if (!value?.reads) {
    return `No posts read on ${formattedDate}`;
  }
  return (
    <>
      <strong>
        {value.reads} {pluralize('article', value.reads)} read
      </strong>
      &nbsp;on {formattedDate}
    </>
  );
};

export interface ReadingOverviewProps {
  user: PublicProfile;
  readHistory?: UserReadHistory[];
  before: Date;
  after: Date;
  streak?: UserStreak;
  mostReadTags?: MostReadTag[];
  isLoading?: boolean;
}

type ReadingOverviewCardProps = Omit<ReadingOverviewProps, 'isLoading'>;

const ReadingOverviewCard = forwardRef<
  HTMLDivElement,
  ReadingOverviewCardProps
>(function ReadingOverviewCard(
  { user, readHistory, before, after, streak, mostReadTags },
  ref,
): ReactElement {
  const { data: tagTitles = {} } = useQuery(tagTitlesQueryOptions());

  // The card draws one cell per bucket and stops at its grid, so the window
  // is compressed into that many buckets rather than handed a day each: a
  // day per cell would show the oldest weeks and drop everything since.
  const start = after.getTime();
  const span = Math.max(1, before.getTime() - start);
  const buckets = new Array(SNAPSHOT_HEATMAP_CELLS).fill(0);

  readHistory?.forEach((entry) => {
    const offset = (new Date(entry.date).getTime() - start) / span;
    const cell = Math.floor(offset * SNAPSHOT_HEATMAP_CELLS);

    buckets[Math.min(SNAPSHOT_HEATMAP_CELLS - 1, Math.max(0, cell))] +=
      readHistoryToValue(entry);
  });

  const bins = getBins(buckets);

  return (
    <ReadingOverviewSnapshotCard
      heatmap={buckets.map((reads) => getBin(reads, bins))}
      longestStreak={streak?.max ?? 0}
      monthsLabel="in the last months"
      postsRead={sumReadHistory(readHistory)}
      ref={ref}
      seed={user.username ?? user.id}
      topTags={
        mostReadTags?.map((tag) => ({
          name: tagTitles[tag.value] || tag.value,
          percentage: Math.round((tag.percentage ?? 0) * 100),
        })) ?? []
      }
      totalReadingDays={streak?.total ?? 0}
      user={{
        handle: `@${user.username ?? user.id}`,
        image: user.image,
        name: user.name,
      }}
    />
  );
});

export function ReadingOverview({
  user,
  readHistory,
  before,
  after,
  streak,
  mostReadTags,
  isLoading = false,
}: ReadingOverviewProps): ReactElement {
  const totalReads = sumReadHistory(readHistory);

  if (isLoading) {
    return <ReadingOverviewSkeleton />;
  }

  return (
    <ActivityContainer>
      <div className="flex items-center justify-between gap-2">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          className="flex items-center"
        >
          Reading Overview
        </Typography>
        <ProfileSnapshotButton
          filename={`daily-reading-overview-${user.username ?? user.id}`}
          origin={Origin.ReadingOverview}
          renderCard={(ref) => (
            <ReadingOverviewCard
              after={after}
              before={before}
              mostReadTags={mostReadTags}
              readHistory={readHistory}
              ref={ref}
              streak={streak}
              user={user}
            />
          )}
          targetId={user.id}
        />
      </div>
      <ClickableText
        tag="a"
        target="_blank"
        href={migrateUserToStreaks}
        rel={anchorDefaultRel}
      >
        Learn more
      </ClickableText>

      {!!streak && <ReadingStreaksSection streak={streak} />}
      {mostReadTags && mostReadTags?.length > 0 && (
        <ReadingTagsSection mostReadTags={mostReadTags} />
      )}
      <Typography
        tag={TypographyTag.H3}
        type={TypographyType.Subhead}
        color={TypographyColor.Tertiary}
        className="mb-3"
      >
        Posts read in the last months
        {totalReads >= 0 && ` (${largeNumberFormat(totalReads)})`}
      </Typography>
      {Array.isArray(readHistory) && (
        <CalendarHeatmap
          startDate={after}
          endDate={before}
          values={readHistory}
          valueToCount={readHistoryToValue}
          valueToTooltip={readHistoryToTooltip}
        />
      )}
      <HeatmapLegend />
    </ActivityContainer>
  );
}
