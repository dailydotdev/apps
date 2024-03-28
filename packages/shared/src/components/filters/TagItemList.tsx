import React, { ReactElement } from 'react';
import { Tag } from '../../graphql/feedSettings';
import { TagActionArguments } from '../../hooks/useTagAndSource';
import { HTMLElementComponent } from '../utilities';
import { FiltersList, FiltersGrid } from './common';
import { TagCategoryLayout } from './TagCategoryDropdown';
import TagItemRow from './TagItemRow';

type TagItemListProps = {
  tagCategoryLayout?: TagCategoryLayout;
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

const Container: Record<TagCategoryLayout, HTMLElementComponent> = {
  settings: FiltersGrid,
  default: FiltersList,
};

export default function TagItemList({
  tagCategoryLayout = TagCategoryLayout.Default,
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
  const Component = Container[tagCategoryLayout];

  return (
    <Component className={!tags?.length ? 'mt-0' : 'mt-3'}>
      {!tags?.length && (
        <p className="mx-6 text-text-tertiary typo-callout">{emptyText}</p>
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
    </Component>
  );
}
