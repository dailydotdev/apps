import React, { ReactElement } from 'react';
import { TagCategory } from '../../graphql/feedSettings';
import ArrowIcon from '../../../icons/arrow.svg';
import CategoryButton from './CategoryButton';
import TagButton from './TagButton';
import {
  TagCategoryDetails,
  TagCategoryDetailsContent,
  TagCategorySummary,
} from './common';

export default function TagCategoryDropdown({
  tagCategory,
  followedTags,
  blockedTags,
  onFollowTags,
  onUnfollowTags,
  onUnblockTags,
}: {
  tagCategory: TagCategory;
  followedTags?: Array<string>;
  blockedTags?: Array<string>;
  onFollowTags?: (tags, category?) => void;
  onUnfollowTags?: (tags, category?) => void;
  onUnblockTags?: (tags) => void;
}): ReactElement {
  return (
    <TagCategoryDetails>
      <TagCategorySummary>
        <div className="flex items-center">
          <ArrowIcon className="mr-2 text-xl transition-transform transform rotate-90 icon text-theme-label-tertiary" />{' '}
          <span className="mr-3 typo-title1">{tagCategory.emoji}</span>{' '}
          <h4 className="font-bold typo-callout">{tagCategory.title}</h4>{' '}
        </div>
        <CategoryButton
          followedTags={followedTags}
          category={tagCategory}
          onFollowTags={onFollowTags}
          onUnfollowTags={onUnfollowTags}
        />
      </TagCategorySummary>
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
    </TagCategoryDetails>
  );
}
