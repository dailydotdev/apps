import type { ReactElement } from 'react';
import React from 'react';
import {
  ButtonV2,
  ButtonColor,
  ButtonVariant,
} from '../../../../buttons/ButtonV2';
import { UserVote } from '../../../../../graphql/posts';
import { DownvoteIcon, UpvoteIcon } from '../../../../icons';
import type { FeedbackProps } from './common';

export const FeedbackButtons = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
}: FeedbackProps): ReactElement => {
  return (
    <div className="relative flex items-center gap-3">
      <ButtonV2
        id="upvote-post-btn"
        pressed={post?.userState?.vote === UserVote.Up}
        onClick={onUpvoteClick}
        icon={<UpvoteIcon secondary={post?.userState?.vote === UserVote.Up} />}
        variant={ButtonVariant.Secondary}
        color={ButtonColor.Avocado}
        aria-label="Upvote"
      />
      <ButtonV2
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
