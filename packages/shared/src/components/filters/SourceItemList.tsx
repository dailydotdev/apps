import type { ReactElement } from 'react';
import React from 'react';
import { FiltersList } from './common';
import type { Source } from '../../graphql/sources';
import SourceItemRow from './SourceItemRow';

export default function SourceItemList({
  excludeSources,
  onSourceClick,
}: {
  excludeSources: Source[];
  onSourceClick?: (source) => unknown;
}): ReactElement {
  return (
    <FiltersList className={!excludeSources?.length ? 'mt-0' : 'mt-3'}>
      {!excludeSources?.length && (
        <p className="text-text-tertiary typo-callout">No blocked sources.</p>
      )}
      {excludeSources?.map((source) => (
        <SourceItemRow
          key={source.id}
          source={source}
          blocked
          onSourceClick={onSourceClick}
        />
      ))}
    </FiltersList>
  );
}
