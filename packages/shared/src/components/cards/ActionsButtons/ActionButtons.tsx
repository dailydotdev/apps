import React, { ReactElement, useState } from 'react';
import classNames from 'classnames';
import { Post, UserVote } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import {
  DiscussIcon as CommentIcon,
  BookmarkIcon,
  LinkIcon,
} from '../../icons';
import {
  Button,
  ButtonColor,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import { useFeedPreviewMode } from '../../../hooks';
import { UpvoteButtonIcon } from './UpvoteButtonIcon';
import { BookmarkButton } from '../../buttons';

export interface ActionButtonsProps {
  post: Post;
  onUpvoteClick: (post: Post) => unknown;
  onCommentClick: (post: Post) => unknown;
  onBookmarkClick: (post: Post) => unknown;
  onCopyLinkClick: (event: React.MouseEvent, post: Post) => unknown;
  className?: string;
}

export default function ActionButtons({
  post,
  onUpvoteClick,
  onCommentClick,
  onBookmarkClick,
  onCopyLinkClick,
  className,
}: ActionButtonsProps): ReactElement {
  const upvoteCommentProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
  };
  const isFeedPreview = useFeedPreviewMode();
  const isUpvoteActive = post?.userState?.vote === UserVote.Up;
  const [userUpvoted, setUserUpvoted] = useState(false);

  if (isFeedPreview) {
    return null;
  }

  const lastActions = (
    <>
      <BookmarkButton
        post={post}
        buttonProps={{
          id: `post-${post.id}-bookmark-btn`,
          icon: <BookmarkIcon secondary={post.bookmarked} />,
          onClick: () => onBookmarkClick(post),
          className: 'btn-tertiary-bun !min-w-[4.625rem]',
        }}
      />
      <SimpleTooltip content="Copy link">
        <Button
          size={ButtonSize.Small}
          icon={<LinkIcon />}
          onClick={(e) => onCopyLinkClick?.(e, post)}
          variant={ButtonVariant.Tertiary}
          color={ButtonColor.Cabbage}
        />
      </SimpleTooltip>
    </>
  );

  return (
    <div
      className={classNames(
        'flex flex-row items-center justify-between',
        className,
      )}
    >
      <SimpleTooltip
        content={
          post?.userState?.vote === UserVote.Up ? 'Remove upvote' : 'Upvote'
        }
      >
        <QuaternaryButton
          id={`post-${post.id}-upvote-btn`}
          icon={
            <UpvoteButtonIcon
              secondary={post?.userState?.vote === UserVote.Up}
              userClicked={userUpvoted}
            />
          }
          pressed={isUpvoteActive}
          onClick={() => {
            onUpvoteClick?.(post);
            setUserUpvoted(true);
          }}
          {...upvoteCommentProps}
          className="btn-tertiary-avocado !min-w-[4.625rem]"
        >
          <InteractionCounter value={post.numUpvotes > 0 && post.numUpvotes} />
        </QuaternaryButton>
      </SimpleTooltip>
      <SimpleTooltip content="Comments">
        <QuaternaryButton
          id={`post-${post.id}-comment-btn`}
          icon={<CommentIcon secondary={post.commented} />}
          pressed={post.commented}
          onClick={() => onCommentClick?.(post)}
          {...upvoteCommentProps}
          className="btn-tertiary-blueCheese !min-w-[4.625rem]"
        >
          <InteractionCounter
            value={post.numComments > 0 && post.numComments}
          />
        </QuaternaryButton>
      </SimpleTooltip>
      {lastActions}
    </div>
  );
}
