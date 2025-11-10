import type { ReactElement } from 'react';
import React from 'react';
import type { MostReadTag } from '../../graphql/users';
import Link from '../utilities/Link';
import { getTagPageLink } from '../../lib';
import { Tooltip } from '../tooltip/Tooltip';

interface ReadingTagProgressProps {
  tag: MostReadTag;
}

export function ReadingTagProgress({
  tag: { value: tag, count, percentage, total },
}: ReadingTagProgressProps): ReactElement {
  const value = `${(percentage * 100).toFixed(0)}%`;

  return (
    <Tooltip content={`${count}/${total} reading days`} side="top">
      <div
        key={tag}
        className="rounded-10 border-background-subtle text-text-tertiary typo-callout relative flex flex-row overflow-hidden border p-1 px-3 pb-2 font-bold"
      >
        <Link href={getTagPageLink(tag)} passHref prefetch={false}>
          <a>#{tag}</a>
        </Link>
        <span className="text-text-primary ml-auto">{value}</span>
        <div
          className="rounded-8 bg-text-primary absolute bottom-0 left-0 h-1 overflow-hidden"
          style={{ width: value }}
          data-testid="tagProgress"
        />
      </div>
    </Tooltip>
  );
}
