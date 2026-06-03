import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import type { TagCategory } from '../../graphql/feedSettings';
import { getExploreTagPageLink } from '../../lib/links';
import { formatKeyword } from '../../lib/strings';
import Link from '../utilities/Link';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { ClickableText } from '../buttons/ClickableText';

const COLLAPSED_COUNT = 8;

interface ExploreCategorySectionProps {
  category: TagCategory;
  className?: string;
}

// One column block in the Explore directory: an emoji + title heading above a
// vertical list of topic links (Medium "Explore topics" / glossary hub style).
export function ExploreCategorySection({
  category,
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
      <ul className="flex flex-col gap-2.5">
        {visibleTags.map((tag) => (
          <li key={tag}>
            <Link href={getExploreTagPageLink(tag)} passHref prefetch={false}>
              <Typography
                tag={TypographyTag.Link}
                type={TypographyType.Callout}
                color={TypographyColor.Secondary}
                className="cursor-pointer no-underline transition-colors hover:text-text-primary"
              >
                {formatKeyword(tag)}
              </Typography>
            </Link>
          </li>
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
