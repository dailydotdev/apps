import type { ReactElement } from 'react';
import React from 'react';
import { ProfileImageSize } from '../ProfilePicture';
import { SourceAvatar } from '../profile/source/SourceAvatar';
import Link from '../utilities/Link';
import type { Post } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import { DiscussIcon, LockIcon, UpvoteIcon } from '../icons';
import { largeNumberFormat } from '../../lib/numberFormat';
import { UserShortInfo } from '../profile/UserShortInfo';
import { TimeFormatType, formatDate } from '../../lib/dateFormat';

interface RepostListItemProps {
  post: Post;
  scrollingContainer?: HTMLElement;
  appendTooltipTo?: HTMLElement;
}

export function RepostListItem({
  post,
  scrollingContainer,
  appendTooltipTo,
}: RepostListItemProps): ReactElement {
  const isUserSource = isSourceUserSource(post.source);
  const upvotes = post.numUpvotes ?? 0;
  const comments = post.numComments ?? 0;
  const { author } = post;
  const showSquadPreview = !isUserSource && !!post.source;
  const isPrivateSquad = showSquadPreview && !post.source.public;

  const renderUserInfo = () => {
    if (!author) {
      return null;
    }

    const userShortInfoProps = {
      user: author,
      showDescription: false,
      scrollingContainer,
      appendTooltipTo,
    };

    if (author.permalink) {
      return (
        <Link href={author.permalink}>
          <UserShortInfo
            {...userShortInfoProps}
            className={{ container: 'cursor-pointer' }}
            tag="a"
            href={author.permalink}
          />
        </Link>
      );
    }

    return (
      <UserShortInfo
        {...userShortInfoProps}
        className={{ container: '' }}
        tag="div"
      />
    );
  };

  return (
    <div className="border-b border-border-subtlest-tertiary px-6 py-5 last:border-b-0">
      {/* Squad name + lock + date */}
      {showSquadPreview && (
        <div className="mb-3 flex items-center gap-1">
          <SourceAvatar
            source={post.source}
            size={ProfileImageSize.XSmall}
            className="!mr-0"
          />
          {post.source.permalink ? (
            <Link href={post.source.permalink}>
              <a className="truncate text-text-secondary typo-callout hover:underline">
                {post.source.name}
              </a>
            </Link>
          ) : (
            <span className="truncate text-text-secondary typo-callout">
              {post.source.name}
            </span>
          )}
          {isPrivateSquad && (
            <LockIcon className="size-3.5 text-text-quaternary" />
          )}
          {post.createdAt && (
            <>
              <span className="text-text-tertiary typo-footnote">·</span>
              <span className="shrink-0 text-text-tertiary typo-footnote">
                {formatDate({
                  value: post.createdAt,
                  type: TimeFormatType.Post,
                })}
              </span>
            </>
          )}
        </div>
      )}

      {/* User info row */}
      {renderUserInfo()}

      {/* Post text content */}
      {isPrivateSquad ? (
        <p className="mt-3 text-text-quaternary typo-callout">
          This post was shared in a private squad
        </p>
      ) : (
        post.title && (
          <p className="mt-3 line-clamp-3 text-text-primary typo-body">
            {post.title}
          </p>
        )
      )}

      {/* Upvotes and comments */}
      {!isPrivateSquad && (
        <div className="mt-3 flex items-center gap-4 text-text-quaternary typo-callout">
          <span className="flex items-center gap-1.5">
            <UpvoteIcon className="size-4" />
            {largeNumberFormat(upvotes)}
          </span>
          <span className="flex items-center gap-1.5">
            <DiscussIcon className="size-4" />
            {largeNumberFormat(comments)}
          </span>
        </div>
      )}
    </div>
  );
}
