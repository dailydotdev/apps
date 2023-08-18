import React, { MouseEvent, ReactElement } from 'react';
import classNames from 'classnames';
import Link from 'next/link';
import { HidePostItemCardProps } from '../../graphql/users';
import { PostItem, UserPostVote } from '../../graphql/posts';
import XIcon from '../icons/MiniClose';
import MenuIcon from '../icons/Menu';
import classed from '../../lib/classed';
import { Button, ButtonSize } from '../buttons/Button';
import PostMetadata from '../cards/PostMetadata';
import { ProfilePicture } from '../ProfilePicture';
import { Image } from '../image/Image';
import ConditionalWrapper from '../ConditionalWrapper';
import { cloudinary } from '../../lib/image';
import { mutationHandlers, useVotePost } from '../../hooks';
import UpvoteIcon from '../icons/Upvote';
import DownvoteIcon from '../icons/Downvote';
import useUpdatePost from '../../hooks/useUpdatePost';

export interface PostItemCardProps {
  className?: string;
  postItem: PostItem;
  showButtons?: boolean;
  clickable?: boolean;
  onHide?: (params: HidePostItemCardProps) => Promise<unknown>;
  onContextMenu?: (event: React.MouseEvent, post: PostItem) => void;
  hasEngagementLoopAccess?: boolean;
}

const SourceShadow = classed(
  'div',
  'absolute left-5 -my-1 w-8 h-8 rounded-full bg-theme-bg-primary',
);

export default function PostItemCard({
  postItem,
  showButtons = true,
  clickable = true,
  onHide,
  className,
  onContextMenu,
  hasEngagementLoopAccess = false,
}: PostItemCardProps): ReactElement {
  const { timestampDb, post } = postItem;
  const onHideClick = (e: MouseEvent) => {
    e.stopPropagation();
    onHide({ postId: post.id, timestamp: timestampDb });
  };
  const article = post?.sharedPost ?? post;
  const { updatePost } = useUpdatePost();

  const onUpvotePostMutate = updatePost({
    id: post.id,
    update: mutationHandlers.upvote(post),
  });
  const onCancelPostUpvoteMutate = updatePost({
    id: post.id,
    update: mutationHandlers.cancelUpvote(post),
  });
  const onDownvotePostMutate = updatePost({
    id: post.id,
    update: mutationHandlers.downvote(post),
  });
  const onCancelPostDownvoteMutate = updatePost({
    id: post.id,
    update: mutationHandlers.cancelDownvote(post),
  });

  const { toggleUpvote, toggleDownvote } = useVotePost({
    onUpvotePostMutate,
    onCancelPostUpvoteMutate,
    onDownvotePostMutate,
    onCancelPostDownvoteMutate,
  });

  const classes = classNames(
    'flex relative flex-row py-3 pr-5 pl-9 w-full',
    hasEngagementLoopAccess
      ? 'items-start tablet:items-center'
      : 'items-center',
    clickable && 'hover:bg-theme-hover hover:cursor-pointer',
    className,
  );

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
            className="object-cover w-16 laptop:w-24 h-16 rounded-16"
            loading="lazy"
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          />
          <SourceShadow
            className={classNames(hasEngagementLoopAccess && 'top-8')}
          />
          <ProfilePicture
            size="small"
            rounded="full"
            className={classNames(
              'absolute left-6',
              hasEngagementLoopAccess && 'top-8',
            )}
            user={{
              image: post.source.image,
              username: `source of ${post.title}`,
            }}
            nativeLazyLoading
          />
          <div
            className={classNames(
              'flex-1 flex',
              hasEngagementLoopAccess
                ? 'flex-col tablet:flex-row'
                : 'items-center',
            )}
          >
            <div className="flex flex-col flex-1 ml-4">
              <h3 className="flex flex-1 mr-6 text-left break-words line-clamp-2 typo-callout">
                {post.title}
              </h3>
              <PostMetadata
                readTime={post.readTime}
                numUpvotes={post.numUpvotes}
              />
            </div>
            <div className="flex ml-4 tablet:ml-0">
              {showButtons && hasEngagementLoopAccess && (
                <>
                  <Button
                    buttonSize={ButtonSize.Small}
                    className={classNames(
                      'btn-tertiary',
                      hasEngagementLoopAccess ? 'flex' : 'hidden laptop:flex',
                    )}
                    onClick={() => toggleUpvote(post)}
                    icon={
                      <UpvoteIcon
                        secondary={post.userState?.vote === UserPostVote.Up}
                      />
                    }
                  />
                  <Button
                    buttonSize={ButtonSize.Small}
                    className={classNames(
                      'btn-tertiary',
                      hasEngagementLoopAccess ? 'flex' : 'hidden laptop:flex',
                    )}
                    onClick={() => toggleDownvote(post)}
                    icon={
                      <DownvoteIcon
                        secondary={post.userState?.vote === UserPostVote.Down}
                      />
                    }
                  />
                </>
              )}
              {showButtons && !hasEngagementLoopAccess && onHide && (
                <Button
                  buttonSize={ButtonSize.Small}
                  className="hidden laptop:flex btn-tertiary"
                  icon={<XIcon />}
                  onClick={onHideClick}
                />
              )}
              {showButtons && (
                <Button
                  className="btn-tertiary"
                  data-testId={`post-item-${post.id}`}
                  icon={<MenuIcon />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onContextMenu(event, postItem);
                  }}
                  buttonSize={ButtonSize.Small}
                />
              )}
            </div>
          </div>
        </>
      </ConditionalWrapper>
    </article>
  );
}
