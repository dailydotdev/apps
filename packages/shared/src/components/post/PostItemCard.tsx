import type { MouseEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import type { HidePostItemCardProps } from '../../graphql/users';
import type { PostItem } from '../../graphql/posts';
import { UserVote, isVideoPost } from '../../graphql/posts';
import { MiniCloseIcon as XIcon, UpvoteIcon, DownvoteIcon } from '../icons';
import classed from '../../lib/classed';
import PostMetadata from '../cards/common/PostMetadata';
import { ProfileImageSize, ProfilePicture } from '../ProfilePicture';
import { Image } from '../image/Image';
import ConditionalWrapper from '../ConditionalWrapper';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { useReadHistoryVotePost } from '../../hooks';
import { Origin } from '../../lib/log';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { isSourceUserSource } from '../../graphql/sources';

import { ReadingHistoryOptionsMenu } from '../history/ReadingHistoryOptionsMenu';
import type { QueryIndexes } from '../../hooks/useReadingHistory';

export interface PostItemCardProps {
  className?: string;
  postItem: PostItem;
  showButtons?: boolean;
  clickable?: boolean;
  onHide?: (params: HidePostItemCardProps) => Promise<unknown>;
  showVoteActions?: boolean;
  logOrigin?: Origin;
  indexes?: QueryIndexes;
}

const SourceShadow = classed(
  'div',
  'absolute left-5 -my-1 w-8 h-8 bg-background-default',
);

export default function PostItemCard({
  postItem,
  showButtons = true,
  clickable = true,
  onHide,
  className,
  showVoteActions = false,
  logOrigin = Origin.Feed,
  indexes,
}: PostItemCardProps): ReactElement {
  const { timestampDb, post } = postItem;
  const onHideClick = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onHide({ postId: post.id, timestamp: timestampDb });
  };
  const article = post?.sharedPost ?? post;
  const isUserSource = isSourceUserSource(post.source);

  const { toggleUpvote, toggleDownvote } = useReadHistoryVotePost();

  const classes = classNames(
    'relative flex w-full flex-row py-3 pl-9 pr-5',
    showVoteActions ? 'items-start tablet:items-center' : 'items-center',
    clickable && 'hover:cursor-pointer hover:bg-surface-hover',
    className,
  );

  const title = post?.title || post?.sharedPost?.title;

  return (
    <article className={classNames(!clickable && classes)}>
      <ConditionalWrapper
        condition={clickable}
        wrapper={(children) => (
          <Link href={post.commentsPermalink}>
            <a className={classes} title="Go to post">
              {children}
            </a>
          </Link>
        )}
      >
        <>
          <Image
            src={article.image}
            alt={post.title}
            className="h-16 w-16 rounded-16 object-cover laptop:w-24"
            loading="lazy"
            fallbackSrc={cloudinaryPostImageCoverPlaceholder}
          />
          <SourceShadow
            className={classNames(
              showVoteActions && 'top-8',
              isUserSource ? 'rounded-12' : 'rounded-full',
            )}
          />
          <ProfilePicture
            size={ProfileImageSize.Small}
            rounded={isUserSource ? ProfileImageSize.Small : 'full'}
            className={classNames(
              'absolute left-6',
              showVoteActions && 'top-8',
            )}
            user={{
              image: isUserSource ? post.author.image : post.source.image,
              username: `source of ${title}`,
            }}
            nativeLazyLoading
          />
          <div
            className={classNames(
              'flex flex-1',
              showVoteActions ? 'flex-col tablet:flex-row' : 'items-center',
            )}
          >
            <div className="ml-4 flex flex-1 flex-col">
              <h3 className="mr-6 line-clamp-2 flex flex-1 break-words text-left typo-callout">
                {title}
              </h3>
              <PostMetadata
                readTime={post.readTime}
                numUpvotes={post.numUpvotes}
                isVideoType={isVideoPost(post)}
              />
            </div>
            <div className="ml-4 mt-1 flex tablet:ml-0 tablet:mt-1">
              {showButtons && showVoteActions && (
                <>
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    color={showVoteActions ? ButtonColor.Avocado : undefined}
                    className={showVoteActions ? 'flex' : 'hidden laptop:flex'}
                    pressed={post?.userState?.vote === UserVote.Up}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleUpvote({ payload: post, origin: logOrigin });
                    }}
                    icon={
                      <UpvoteIcon
                        secondary={post?.userState?.vote === UserVote.Up}
                      />
                    }
                  />
                  <Button
                    size={ButtonSize.Small}
                    variant={ButtonVariant.Tertiary}
                    color={showVoteActions ? ButtonColor.Ketchup : undefined}
                    className={showVoteActions ? 'flex' : 'hidden laptop:flex'}
                    pressed={post?.userState?.vote === UserVote.Down}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleDownvote({
                        payload: post,
                        origin: logOrigin,
                      });
                    }}
                    icon={
                      <DownvoteIcon
                        secondary={post?.userState?.vote === UserVote.Down}
                      />
                    }
                  />
                </>
              )}
              {showButtons && !showVoteActions && onHide && (
                <Button
                  size={ButtonSize.Small}
                  variant={ButtonVariant.Tertiary}
                  className="hidden laptop:flex"
                  icon={<XIcon />}
                  onClick={onHideClick}
                />
              )}
              {showButtons && (
                <ReadingHistoryOptionsMenu
                  post={post}
                  indexes={indexes}
                  onHide={
                    onHide
                      ? () =>
                          onHide({ postId: post.id, timestamp: timestampDb })
                      : undefined
                  }
                />
              )}
            </div>
          </div>
        </>
      </ConditionalWrapper>
    </article>
  );
}
