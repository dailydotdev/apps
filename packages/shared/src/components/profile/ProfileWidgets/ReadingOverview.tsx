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
} from './ReadingOverviewComponents';

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
        {value.reads} article{value.reads > 1 ? 's' : ''} read
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
}

export function ReadingOverview({
  readHistory,
  before,
  after,
  streak,
  mostReadTags,
}: ReadingOverviewProps): ReactElement {
  const totalReads = useMemo(
    () => readHistory?.reduce((acc, val) => acc + val.reads, 0),
    [readHistory],
  );

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
      <ClickableText tag="a" target="_blank" href={migrateUserToStreaks}>
        Learn more
      </ClickableText>

      <ReadingStreaksSection streak={streak} />
      <ReadingTagsSection mostReadTags={mostReadTags} />

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
