import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { TagCategory } from '../../graphql/feedSettings';
import { TagDirectoryListItem } from './TagDirectoryListItem';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ClickableText } from '../buttons/ClickableText';

const COLLAPSED_COUNT = 8;

interface TagCategorySectionProps {
  category: TagCategory;
  followedTags: Set<string>;
  onToggleFollow: (tag: string) => void;
  titleByValue?: Map<string, string>;
  className?: string;
}

// One column block in the tag directory: an emoji + title heading above a
// vertical list of tag rows with follow controls.
export function TagCategorySection({
  category,
  followedTags,
  onToggleFollow,
  titleByValue,
  className,
}: TagCategorySectionProps): ReactElement | null {
  const [expanded, setExpanded] = useState(false);

  if (!category.tags?.length) {
    return null;
  }

  const visibleTags = expanded
    ? category.tags
    : category.tags.slice(0, COLLAPSED_COUNT);
  const hasMore = category.tags.length > COLLAPSED_COUNT;

  return (
    <section
      id={`tag-category-${category.id}`}
      className={classNames(
        'mb-8 flex scroll-mt-24 break-inside-avoid flex-col gap-3',
        className,
      )}
    >
      <Typography
        tag={TypographyTag.H2}
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        {category.emoji ? `${category.emoji} ` : ''}
        {category.title}
      </Typography>
      <ul className="flex flex-col">
        {visibleTags.map((tag) => (
          <TagDirectoryListItem
            key={tag}
            tag={tag}
            title={titleByValue?.get(tag)}
            isFollowed={followedTags.has(tag)}
            onToggleFollow={onToggleFollow}
          />
        ))}
      </ul>
      {hasMore && (
        <ClickableText
          tag="button"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-fit"
        >
          {expanded ? 'Show less' : 'More'}
        </ClickableText>
      )}
    </section>
  );
}
