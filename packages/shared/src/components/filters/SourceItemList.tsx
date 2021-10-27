import React, { ReactElement } from 'react';
import { FiltersList } from './common';
import { Source } from '../../graphql/sources';
import SourceItemRow from './SourceItemRow';

export default function SourceItemList({
  excludeSources,
  action,
}: {
  excludeSources: Source[];
  action?: (source) => unknown;
}): ReactElement {
  return (
    <FiltersList className="mt-6">
      {!excludeSources?.length && (
        <p className="mx-6 typo-callout text-theme-label-tertiary">
          No blocked sources.
        </p>
      )}
      {excludeSources?.map((source) => (
        <SourceItemRow
          key={source.id}
          source={source}
          blocked
          onClick={() => action(source)}
        />
      ))}
    </FiltersList>
  );
}
