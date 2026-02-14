import type { ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { SourceAvatar } from '../profile/source/SourceAvatar';
import Link from '../utilities/Link';
import type { Post } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { DiscussIcon, UpvoteIcon } from '../icons';
import { largeNumberFormat } from '../../lib/numberFormat';

interface RepostListItemProps {
  post: Post;
}

export function RepostListItem({ post }: RepostListItemProps): ReactElement {
  const isUserSource = isSourceUserSource(post.source);
  const upvotes = post.numUpvotes ?? 0;
  const comments = post.numComments ?? 0;

  const content = (
    <article className="p-4 hover:bg-surface-hover">
      <div className="flex min-w-0 flex-wrap items-center gap-2 typo-footnote">
        {!isUserSource && post.source && (
          <>
            <SourceAvatar
              source={post.source}
              size={ProfileImageSize.XSmall}
              className="!mr-0"
            />
            <Link href={post.source.permalink}>
              <a className="truncate text-text-secondary">{post.source.name}</a>
            </Link>
          </>
        )}
        {post.author && (
          <>
            {!isUserSource && <span className="text-text-tertiary">/</span>}
            <ProfilePicture
              user={post.author}
              size={ProfileImageSize.XSmall}
              rounded="full"
              nativeLazyLoading
            />
            <Link href={post.author.permalink}>
              <a className="truncate text-text-secondary">{post.author.name}</a>
            </Link>
          </>
        )}
      </div>
      {!!post.title && (
        <p className="mt-2 line-clamp-2 text-text-primary typo-callout">
          {post.title}
        </p>
      )}
      <div className="mt-2 flex items-center gap-4 text-text-tertiary typo-footnote">
        <span className="flex items-center gap-1">
          <UpvoteIcon className="size-4" />
          {largeNumberFormat(upvotes)}
        </span>
        <span className="flex items-center gap-1">
          <DiscussIcon className="size-4" />
          {largeNumberFormat(comments)}
        </span>
      </div>
    </article>
  );

  if (!post.commentsPermalink) {
    return content;
  }

  return (
    <Link href={post.commentsPermalink}>
      <a>{content}</a>
    </Link>
  );
}
