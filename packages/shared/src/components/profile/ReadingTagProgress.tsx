import React, { ReactElement } from 'react';
import { getDayOfYear } from 'date-fns';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { ReadingTopTag } from '../../graphql/users';

interface ReadingTagProgressProps {
  topTag: ReadingTopTag;
  isFilterSameYear?: boolean;
}

export function ReadingTagProgress({
  topTag: { tag, readingDays, percentage },
  isFilterSameYear = true,
}: ReadingTagProgressProps): ReactElement {
  const value = `${(percentage * 100).toFixed(0)}%`;
  const denominator = isFilterSameYear ? getDayOfYear(new Date()) : '365';

  return (
    <SimpleTooltip
      content={`${readingDays}/${denominator} reading days`}
      placement="top"
    >
      <div
        key={tag}
        className="flex overflow-hidden relative flex-row p-1 px-3 pb-2 font-bold rounded-10 border border-theme-bg-secondary typo-callout text-theme-label-tertiary"
      >
        #{tag}
        <span className="ml-auto text-theme-label-primary">{value}</span>
        <div
          className="overflow-hidden absolute bottom-0 left-0 h-1 rounded-8 bg-theme-label-primary"
          style={{ width: value }}
        />
      </div>
    </SimpleTooltip>
  );
}
