import React, { ReactElement } from 'react';
import { FiltersList } from './common';
import TagItemRow from './TagItemRow';

export default function TagItemList({
  blockedTags,
  options,
}: {
  blockedTags: string[];
  options?: (event: React.MouseEvent, tag: string) => void;
}): ReactElement {
  return (
    <FiltersList className={!blockedTags?.length ? 'mt-0' : 'mt-3'}>
      {!blockedTags?.length && (
        <p className="mx-6 typo-callout text-theme-label-tertiary">
          No blocked tags.
        </p>
      )}
      {blockedTags?.map((tag) => (
        <TagItemRow
          tag={tag}
          key={tag}
          tooltip="Options"
          onClick={options}
          menu
        />
      ))}
    </FiltersList>
  );
}
