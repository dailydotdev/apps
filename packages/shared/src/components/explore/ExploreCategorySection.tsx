import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { TagCategory } from '../../graphql/feedSettings';
import { TagChip } from '../tags/TagChip';
import { getExploreTagPageLink } from '../../lib/links';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ClickableText } from '../buttons/ClickableText';

const COLLAPSED_COUNT = 12;

interface ExploreCategorySectionProps {
  category: TagCategory;
  followedTags: Set<string>;
  className?: string;
}

export function ExploreCategorySection({
  category,
  followedTags,
  className,
}: ExploreCategorySectionProps): ReactElement | null {
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
      id={`explore-category-${category.id}`}
      className={classNames('flex scroll-mt-20 flex-col gap-3', className)}
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
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => (
          <TagChip
            key={tag}
            tag={tag}
            size="md"
            isFollowed={followedTags.has(tag)}
            link={getExploreTagPageLink(tag)}
          />
        ))}
      </div>
      {hasMore && (
        <ClickableText
          tag="button"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-fit"
        >
          {expanded ? 'Show less' : `Show all ${category.tags.length}`}
        </ClickableText>
      )}
    </section>
  );
}
