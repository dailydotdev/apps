import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  UserReadHistory,
  UserStreak,
  MostReadTag,
} from '../../../../graphql/users';
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
import { largeNumberFormat } from '../../../../lib';
import { SnapshotButton } from '../../../../components/imageShare/SnapshotButton';
import { ReadingOverviewSnapshotCard } from '../../../snapshot/ReadingOverviewSnapshotCard';
import { tagTitlesQueryOptions } from '../../../../graphql/keywords';
import type { PublicProfile } from '../../../../lib/user';
import { ButtonSize } from '../../../../components/buttons/common';

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

export function ReadingOverview({
  user,
  readHistory,
  before,
  after,
  streak,
  mostReadTags,
  isLoading = false,
}: ReadingOverviewProps): ReactElement {
  const totalReads = useMemo(() => {
    if (!readHistory?.length) {
      return 0;
    }
    return readHistory.reduce((acc, val) => {
      const reads = val?.reads || 0;
      return acc + (typeof reads === 'number' && reads >= 0 ? reads : 0);
    }, 0);
  }, [readHistory]);

  const { data: tagTitles = {} } = useQuery<Record<string, string>>(
    tagTitlesQueryOptions(),
  );
  const heatmap = useMemo(() => {
    const counts = readHistory?.map(readHistoryToValue) ?? [];
    const bins = getBins(counts);

    return counts.map((count) => getBin(count, bins));
  }, [readHistory]);

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
        <SnapshotButton
          card={
            <ReadingOverviewSnapshotCard
              heatmap={heatmap}
              longestStreak={streak?.max ?? 0}
              monthsLabel="in the last months"
              postsRead={totalReads}
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
          }
          filename="daily-reading-overview"
          showLabel={false}
          size={ButtonSize.XSmall}
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
