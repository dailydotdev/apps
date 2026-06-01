import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { TopPost } from '@dailydotdev/shared/src/graphql/feed';
import { TagPostRow } from './TagPostRow';

interface TagPostListProps {
  title: string;
  posts: TopPost[];
  ranked?: boolean;
  live?: boolean;
  seeAllHref?: string;
  limit?: number;
}

/**
 * A titled section of native post rows — the scannable, discussion-style core
 * of the tag hub. Optionally numbered (a ranked board) and/or marked "live".
 */
export function TagPostList({
  title,
  posts,
  ranked = false,
  live = false,
  seeAllHref,
  limit = 6,
}: TagPostListProps): ReactElement | null {
  const usable = posts.filter((post) => !!post.title).slice(0, limit);
  if (usable.length < 3) {
    return null;
  }

  return (
    <section className="mx-4 flex scroll-mt-16 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {live && (
            <span className="size-2 animate-scale-down-pulse rounded-full bg-accent-ketchup-default" />
          )}
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            {title}
          </Typography>
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} passHref prefetch={false}>
            <a className="text-text-tertiary typo-footnote hover:text-text-primary">
              See all
            </a>
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {usable.map((post, index) => (
          <TagPostRow
            key={post.id}
            post={post}
            rank={ranked ? index + 1 : undefined}
          />
        ))}
      </div>
    </section>
  );
}
