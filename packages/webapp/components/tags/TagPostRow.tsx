import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { CardLink } from '@dailydotdev/shared/src/components/cards/common/Card';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { anchorDefaultRel } from '@dailydotdev/shared/src/lib/strings';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { TopPost } from '@dailydotdev/shared/src/graphql/feed';

interface TagPostRowProps {
  post: TopPost;
  rank?: number;
}

const fmt = (value?: number): string | undefined =>
  value && value > 0 ? `${largeNumberFormat(value) ?? value}` : undefined;

/**
 * Native daily.dev list row for a post — mirrors the briefing list item: a
 * bordered rounded-16 row with an optional rank, a clamped title, a single
 * metadata line, a thumbnail, and a full-row CardLink. This is the building
 * block that turns the tag page into a scannable, discussion-style hub.
 */
export function TagPostRow({ post, rank }: TagPostRowProps): ReactElement {
  const meta = [
    post.source?.name,
    fmt(post.numUpvotes) && `${fmt(post.numUpvotes)} upvotes`,
    fmt(post.numComments) && `${fmt(post.numComments)} comments`,
    post.readTime ? `${post.readTime}m read` : undefined,
  ].filter(Boolean);

  return (
    <article className="relative flex w-full items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary tablet:gap-4">
      {!!rank && (
        <span className="w-5 shrink-0 text-center font-bold tabular-nums text-text-quaternary typo-title3">
          {rank}
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Typography
          tag={TypographyTag.H3}
          type={TypographyType.Callout}
          bold
          className="line-clamp-2"
        >
          {post.title}
        </Typography>
        {meta.length > 0 && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            truncate
          >
            {meta.join(' • ')}
          </Typography>
        )}
      </div>
      {post.image && (
        <img
          src={post.image}
          alt=""
          aria-hidden
          className="hidden h-14 w-20 shrink-0 rounded-12 object-cover mobileXL:block"
        />
      )}
      <Link href={`/posts/${post.slug || post.id}`} passHref prefetch={false}>
        <CardLink title={post.title} rel={anchorDefaultRel} />
      </Link>
    </article>
  );
}
