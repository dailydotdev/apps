import React, { ReactElement } from 'react';
import { Button, ButtonColor, ButtonVariant } from '../../../../buttons/Button';
import { UserVote } from '../../../../../graphql/posts';
import { DownvoteIcon, UpvoteIcon } from '../../../../icons';
import { FeedbackProps } from './common';

export const FeedbackButtons = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
}: FeedbackProps): ReactElement => {
  return (
    <div className="relative flex items-center gap-3">
      <Button
        id="upvote-post-btn"
        pressed={post?.userState?.vote === UserVote.Up}
        onClick={onUpvoteClick}
        icon={<UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />}
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
  );
};
