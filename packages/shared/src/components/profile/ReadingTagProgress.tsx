import React, { ReactElement } from 'react';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import { MostReadTag } from '../../graphql/users';

interface ReadingTagProgressProps {
  tag: MostReadTag;
}

export function ReadingTagProgress({
  tag: { value: tag, count, percentage, total },
}: ReadingTagProgressProps): ReactElement {
  const value = `${(percentage * 100).toFixed(0)}%`;

  return (
    <SimpleTooltip content={`${count}/${total} reading days`} placement="top">
      <div
        key={tag}
        className="relative flex flex-row overflow-hidden rounded-10 border border-background-subtle p-1 px-3 pb-2 font-bold text-text-tertiary typo-callout"
      >
        #{tag}
        <span className="ml-auto text-text-primary">{value}</span>
        <div
          className="absolute bottom-0 left-0 h-1 overflow-hidden rounded-8 bg-text-primary"
          style={{ width: value }}
          data-testid="tagProgress"
        />
      </div>
    </SimpleTooltip>
  );
}
