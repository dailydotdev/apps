import React, { ReactElement, ReactNode, useMemo } from 'react';
import { UserReadHistory } from '../../graphql/users';
import {
  ActivityContainer,
  ActivitySectionTitle,
  ActivitySectionTitleStat,
} from './ActivitySection';
import { CalendarHeatmap } from '../CalendarHeatmap';

const getHistoryTitle = (
  fullHistory: boolean,
  selectedHistoryYear: number,
  yearOptions: string[],
): string => {
  if (fullHistory) {
    if (selectedHistoryYear > 0) {
      return yearOptions[selectedHistoryYear];
    }
    return 'the last year';
  }
  return 'the last months';
};

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

export interface ReadingHeatmapWidgetProps {
  fullHistory: boolean;
  selectedHistoryYear: number;
  readHistory: UserReadHistory[];
  before: Date;
  after: Date;
  yearOptions: string[];
}

export function ReadingHeatmapWidget({
  fullHistory,
  selectedHistoryYear,
  readHistory,
  before,
  after,
  yearOptions,
}: ReadingHeatmapWidgetProps): ReactElement {
  const totalReads = useMemo(
    () => readHistory?.reduce((acc, val) => acc + val.reads, 0),
    [readHistory],
  );

  const title = getHistoryTitle(fullHistory, selectedHistoryYear, yearOptions);
  return (
    <ActivityContainer>
      <ActivitySectionTitle>
        Posts read in {title}
        {totalReads >= 0 && (
          <ActivitySectionTitleStat>({totalReads})</ActivitySectionTitleStat>
        )}
      </ActivitySectionTitle>
      <CalendarHeatmap
        startDate={after}
        endDate={before}
        values={readHistory}
        valueToCount={readHistoryToValue}
        valueToTooltip={readHistoryToTooltip}
      />
      <div className="mt-4 flex items-center justify-between typo-footnote">
        <div className="text-text-quaternary">Inspired by GitHub</div>
        <div className="flex items-center">
          <div className="mr-2">Less</div>
          <div
            className="mr-0.5 h-2 w-2 border border-border-subtlest-quaternary"
            style={{ borderRadius: '0.1875rem' }}
          />
          <div
            className="mr-0.5 h-2 w-2 bg-text-disabled"
            style={{ borderRadius: '0.1875rem' }}
          />
          <div
            className="mr-0.5 h-2 w-2 bg-text-quaternary"
            style={{ borderRadius: '0.1875rem' }}
          />
          <div
            className="mr-0.5 h-2 w-2 bg-text-primary"
            style={{ borderRadius: '0.1875rem' }}
          />
          <div className="ml-2">More</div>
        </div>
      </div>
    </ActivityContainer>
  );
}
