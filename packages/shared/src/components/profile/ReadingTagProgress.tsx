import React, { ReactElement } from 'react';
import { getDayOfYear, getDaysInYear } from 'date-fns';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { MostReadTag } from '../../graphql/users';

interface ReadingTagProgressProps {
  tag: MostReadTag;
  isFilterSameYear?: boolean;
}

const now = new Date();

export function ReadingTagProgress({
  tag: { value: tag, count, percentage },
  isFilterSameYear = true,
}: ReadingTagProgressProps): ReactElement {
  const value = `${(percentage * 100).toFixed(0)}%`;
  const denominator = isFilterSameYear ? getDayOfYear(now) : getDaysInYear(now);

  return (
    <SimpleTooltip
      content={`${count}/${denominator} reading days`}
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
