import React, { MouseEventHandler, ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { DownvoteIcon, UpvoteIcon } from '../icons';
import { Post, UserVote } from '../../graphql/posts';
import { usePostFeedback } from '../../hooks';
import CloseButton from '../CloseButton';

interface FeedbackCardProps {
  post: Post;
  onUpvoteClick: MouseEventHandler;
  onDownvoteClick: MouseEventHandler;
}

export const FeedbackCard = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
}: FeedbackCardProps): ReactElement => {
  const { dismissFeedback } = usePostFeedback({ post });

  return (
    <div className="flex-1 space-y-4 p-6 pb-5">
      <div className="relative block">
        <p className="mr-0 font-bold typo-callout tablet:mr-4">
          Want to see more posts like this?
        </p>
        <CloseButton
          id="close-engagement-loop-btn"
          className="absolute -right-2.5 -top-2.5"
          size={ButtonSize.XSmall}
          onClick={dismissFeedback}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          id="upvote-post-btn"
          pressed={post?.userState?.vote === UserVote.Up}
          onClick={onUpvoteClick}
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />
          }
          variant={ButtonVariant.Secondary}
          color={ButtonColor.Avocado}
          aria-label="Upvote"
        />
        <Button
          id="downvote-post-btn"
          pressed={post?.userState?.vote === UserVote.Down}
          onClick={onDownvoteClick}
          icon={
            <DownvoteIcon secondary={post?.userState?.vote === UserVote.Down} />
          }
          variant={ButtonVariant.Secondary}
          color={ButtonColor.Ketchup}
          aria-label="Downvote"
        />
      </div>
    </div>
  );
};
