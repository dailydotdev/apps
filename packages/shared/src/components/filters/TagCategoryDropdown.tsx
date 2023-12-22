import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { TagCategory } from '../../graphql/feedSettings';
import ArrowIcon from '../icons/Arrow';
import CategoryButton from './CategoryButton';
import TagButton from './TagButton';
import {
  BaseTagCategoryDetails,
  TagCategoryDetails,
  TagCategoryDetailsContent,
  BaseTagCategorySummary,
  TagCategorySummary,
} from './common';
import { TagActionArguments } from '../../hooks/useTagAndSource';
import { HTMLElementComponent } from '../utilities';

export enum TagCategoryLayout {
  Default = 'default',
  Settings = 'settings',
}

const ComponentsByLayout: Record<
  TagCategoryLayout,
  [HTMLElementComponent, HTMLElementComponent]
> = {
  settings: [BaseTagCategoryDetails, BaseTagCategorySummary],
  default: [TagCategoryDetails, TagCategorySummary],
};

interface TagCategoryDropdownProps {
  layout?: TagCategoryLayout;
  tagCategory: TagCategory;
  followedTags?: Array<string>;
  blockedTags?: Array<string>;
  onFollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnfollowTags?: ({ tags, category }: TagActionArguments) => void;
  onUnblockTags?: ({ tags }: TagActionArguments) => void;
}

export default function TagCategoryDropdown({
  layout = TagCategoryLayout.Default,
  tagCategory,
  followedTags,
  blockedTags,
  onFollowTags,
  onUnfollowTags,
  onUnblockTags,
}: TagCategoryDropdownProps): ReactElement {
  const isSettings = layout === TagCategoryLayout.Settings;
  const [Container, Summary] = ComponentsByLayout[layout];
  const categoryFollowed = tagCategory.tags.some((tag) =>
    followedTags.includes(tag),
  );

  return (
    <Container>
      <Summary
        className={classNames(
          isSettings && 'py-5 px-4 rounded-14 bg-theme-divider-tertiary',
          isSettings &&
            categoryFollowed &&
            'border-l-4 border-theme-status-cabbage',
        )}
      >
        <div className="flex items-center">
          <ArrowIcon className="mr-2 text-xl transition-transform rotate-90 icon text-theme-label-tertiary" />{' '}
          <span className="mr-3 typo-title1">{tagCategory.emoji}</span>{' '}
          <h4 className="font-bold typo-callout">{tagCategory.title}</h4>{' '}
        </div>
        <CategoryButton
          followedTags={followedTags}
          category={tagCategory}
          onFollowTags={onFollowTags}
          onUnfollowTags={onUnfollowTags}
        />
      </Summary>
      <TagCategoryDetailsContent data-testid="tagCategoryTags">
        {tagCategory.tags.map((tag) => (
          <TagButton
            className="mr-3 mb-3"
            tagItem={tag}
            followedTags={followedTags}
            blockedTags={blockedTags}
            onFollowTags={onFollowTags}
            onUnfollowTags={onUnfollowTags}
            onUnblockTags={onUnblockTags}
            key={tag}
          />
        ))}
      </TagCategoryDetailsContent>
    </Container>
  );
}
