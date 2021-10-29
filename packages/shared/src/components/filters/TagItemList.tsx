import React, { ReactElement } from 'react';
import { Tag } from '../../graphql/feedSettings';
import { FiltersList } from './common';
import TagItemRow from './TagItemRow';

export default function TagItemList({
  tags,
  emptyText,
  followedTags,
  options,
}: {
  tags: Tag[] | Array<string>;
  emptyText: string;
  followedTags?: Array<string>;
  options?: (event: React.MouseEvent, tag: string) => void;
}): ReactElement {
  return (
    <FiltersList className={!tags?.length ? 'mt-0' : 'mt-3'}>
      {!tags?.length && (
        <p className="mx-6 typo-callout text-theme-label-tertiary">
          {emptyText}
        </p>
      )}
      {tags?.map((tag) => (
        <TagItemRow
          tag={tag.name ? tag.name : tag}
          followedTags={followedTags}
          key={String(tag.name ? tag.name : tag)}
          tooltip="Options"
          onClick={options}
        />
      ))}
    </FiltersList>
  );
}
