import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import styles from '../../cards/Card.module.css';
import { Post, UserPostVote } from '../../../graphql/posts';
import InteractionCounter from '../../InteractionCounter';
import { QuaternaryButton } from '../../buttons/QuaternaryButton';
import UpvoteIcon from '../../icons/Upvote';
import CommentIcon from '../../icons/Discuss';
import { ButtonProps, ButtonSize } from '../../buttons/Button';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';
import LeanShareButton from './LeanShareButton';
import { useActiveFeedContext } from '../../../contexts';

export interface ActionButtonsProps {
  post: Post;
  className?: string;
  children?: ReactNode;
  insaneMode?: boolean;
}

export default function LeanActionButtons({
  post,
  className,
  insaneMode,
}: ActionButtonsProps): ReactElement {
  const upvoteCommentProps: ButtonProps<'button'> = {
    buttonSize: ButtonSize.Small,
  };

  const { onUpvote } = useActiveFeedContext();

  // TODO: Need to add uniform comment way
  const onCommentClick = (post: Post) => {};

  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        insaneMode && 'justify-between',
        className,
      )}
    >
      <SimpleTooltip
        content={
          post?.userState?.vote === UserPostVote.Up ? 'Remove upvote' : 'Upvote'
        }
      >
        <QuaternaryButton
          id={`post-${post.id}-upvote-btn`}
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserPostVote.Up} />
          }
          pressed={post?.userState?.vote === UserPostVote.Up}
          onClick={() => onUpvote?.(post)}
          {...upvoteCommentProps}
          className="btn-tertiary-avocado w-[4.875rem]"
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
          className="btn-tertiary-blueCheese w-[4.875rem]"
        >
          <InteractionCounter
            value={post.numComments > 0 && post.numComments}
          />
        </QuaternaryButton>
      </SimpleTooltip>
      <LeanShareButton post={post} />
    </div>
  );
}
