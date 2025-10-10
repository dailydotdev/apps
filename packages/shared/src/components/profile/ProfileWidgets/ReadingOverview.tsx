import type { ReactElement, ReactNode } from 'react';
import React, { useMemo } from 'react';
import type {
  UserReadHistory,
  UserStreak,
  MostReadTag,
} from '../../../graphql/users';
import { ActivityContainer } from '../ActivitySection';
import { CalendarHeatmap } from '../../CalendarHeatmap';
import { migrateUserToStreaks } from '../../../lib/constants';
import { ClickableText } from '../../buttons/ClickableText';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../typography/Typography';
import {
  ReadingStreaksSection,
  ReadingTagsSection,
  HeatmapLegend,
  ReadingOverviewSkeleton,
} from './ReadingOverviewComponents';
import { anchorDefaultRel, pluralize } from '../../../lib/strings';

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
  readHistory: UserReadHistory[];
  before: Date;
  after: Date;
  streak: UserStreak;
  mostReadTags: MostReadTag[];
  isStreaksEnabled: boolean;
  isLoading?: boolean;
}

export function ReadingOverview({
  readHistory,
  before,
  after,
  streak,
  mostReadTags,
  isStreaksEnabled,
  isLoading = false,
}: ReadingOverviewProps): ReactElement {
  const totalReads = useMemo(() => {
    if (!readHistory || !Array.isArray(readHistory)) {
      return 0;
    }
    return readHistory.reduce((acc, val) => {
      const reads = val?.reads || 0;
      return acc + (typeof reads === 'number' && reads >= 0 ? reads : 0);
    }, 0);
  }, [readHistory]);

  if (isLoading) {
    return <ReadingOverviewSkeleton />;
  }

  return (
    <ActivityContainer>
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Callout}
        color={TypographyColor.Primary}
        bold
        className="flex items-center"
      >
        Reading Overview
      </Typography>
      <ClickableText
        tag="a"
        target="_blank"
        href={migrateUserToStreaks}
        rel={anchorDefaultRel}
      >
        Learn more
      </ClickableText>

      {isStreaksEnabled && streak && <ReadingStreaksSection streak={streak} />}
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
        {totalReads >= 0 && ` (${totalReads})`}
      </Typography>
      <CalendarHeatmap
        startDate={after}
        endDate={before}
        values={readHistory}
        valueToCount={readHistoryToValue}
        valueToTooltip={readHistoryToTooltip}
      />
      <HeatmapLegend />
    </ActivityContainer>
  );
}
