import React, { ReactElement } from 'react';
import { Tag } from '../../graphql/feedSettings';
import { TagActionArguments } from '../../hooks/useTagAndSource';
import { FiltersList, FiltersGrid } from './common';
import TagItemRow from './TagItemRow';

type TagItemListProps = {
  version?: string;
  tags: Tag[] | Array<string>;
  rowIcon: ReactElement;
  tooltip: string;
  emptyText: string;
  followedTags?: Array<string>;
  blockedTags?: Array<string>;
  onFollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnfollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnblockTags?: ({ tags, category }: TagActionArguments) => void;
  options?: (event: React.MouseEvent, tag: string) => void;
};

export default function TagItemList({
  version,
  tags,
  rowIcon,
  tooltip,
  emptyText,
  followedTags,
  blockedTags,
  onFollowTags,
  onUnfollowTags,
  onUnblockTags,
  options,
}: TagItemListProps): ReactElement {
  const Container = version === 'v2' ? FiltersGrid : FiltersList;

  return (
    <Container className={!tags?.length ? 'mt-0' : 'mt-3'}>
      {!tags?.length && (
        <p className="mx-6 typo-callout text-theme-label-tertiary">
          {emptyText}
        </p>
      )}
      {tags?.map((tag) => (
        <TagItemRow
          tag={tag.name ? tag.name : tag}
          rowIcon={rowIcon}
          followedTags={followedTags}
          blockedTags={blockedTags}
          onFollowTags={onFollowTags}
          onUnfollowTags={onUnfollowTags}
          onUnblockTags={onUnblockTags}
          key={String(tag.name ? tag.name : tag)}
          tooltip={tooltip}
          onClick={options}
        />
      ))}
    </Container>
  );
}
