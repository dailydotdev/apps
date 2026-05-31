import type { ReactElement } from 'react';
import React from 'react';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { TopPost } from '@dailydotdev/shared/src/graphql/feed';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import { cloudinaryPostImageCoverPlaceholder } from '@dailydotdev/shared/src/lib/image';
import {
  UpvoteIcon,
  DiscussIcon,
} from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';

interface TagFrontPageProps {
  posts: TopPost[];
}

const postHref = (post: TopPost): string => `/posts/${post.slug || post.id}`;

const PostMeta = ({ post }: { post: TopPost }): ReactElement => (
  <span className="flex items-center gap-3 text-text-tertiary typo-footnote">
    {!!post.numUpvotes && (
      <span className="flex items-center gap-1">
        <UpvoteIcon size={IconSize.Size16} />
        {largeNumberFormat(post.numUpvotes) ?? post.numUpvotes}
      </span>
    )}
    {!!post.numComments && (
      <span className="flex items-center gap-1">
        <DiscussIcon size={IconSize.Size16} />
        {largeNumberFormat(post.numComments) ?? post.numComments}
      </span>
    )}
    {!!post.readTime && <span>{post.readTime} min read</span>}
  </span>
);

/**
 * The topic's "front page": one lead story rendered large, with a ranked
 * "Most read" rail beside it. Turns the best posts for a tag into a designed,
 * editorial composition instead of another uniform feed.
 */
export function TagFrontPage({
  posts,
}: TagFrontPageProps): ReactElement | null {
  const usable = posts.filter((post) => !!post.title);
  if (usable.length < 3) {
    return null;
  }

  const [lead, ...rest] = usable;
  const mostRead = rest.slice(0, 5);

  return (
    <section className="mx-4 grid grid-cols-1 gap-x-8 gap-y-6 laptop:grid-cols-3">
      <Link href={postHref(lead)} passHref prefetch={false}>
        <a className="group flex flex-col gap-3 laptop:col-span-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float">
            <img
              src={lead.image || cloudinaryPostImageCoverPlaceholder}
              alt={lead.title}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute left-3 top-3 rounded-8 bg-overlay-primary-pepper px-2 py-1 uppercase tracking-wider text-white typo-caption2">
              Lead story
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-tertiary typo-footnote">
            {lead.source?.name && (
              <span className="font-bold text-text-secondary">
                {lead.source.name}
              </span>
            )}
          </div>
          <h2 className="font-bold typo-title2 group-hover:text-text-link tablet:typo-title1">
            {lead.title}
          </h2>
          <PostMeta post={lead} />
        </a>
      </Link>

      <div className="flex flex-col">
        <span className="mb-3 border-b border-border-subtlest-tertiary pb-2 uppercase tracking-widest text-text-quaternary typo-caption1">
          Most read
        </span>
        <ol className="flex flex-col">
          {mostRead.map((post, index) => (
            <li key={post.id}>
              <Link href={postHref(post)} passHref prefetch={false}>
                <a className="group flex gap-3 border-b border-border-subtlest-tertiary py-3 last:border-b-0">
                  <span className="font-bold tabular-nums text-text-quaternary typo-title3">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="line-clamp-2 font-bold typo-callout group-hover:text-text-link">
                      {post.title}
                    </span>
                    <PostMeta post={post} />
                  </span>
                </a>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
