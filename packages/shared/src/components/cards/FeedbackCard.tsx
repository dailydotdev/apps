import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import DownvoteIcon from '../icons/Downvote';
import MiniCloseIcon from '../icons/MiniClose';
import UpvoteIcon from '../icons/Upvote';
import { Post, UserPostVote } from '../../graphql/posts';
import { usePostFeedback, useVotePost } from '../../hooks';
import { Origin } from '../../lib/analytics';

interface FeedbackCardProps {
  post: Post;
}

export const FeedbackCard = ({ post }: FeedbackCardProps): ReactElement => {
  const { dismissFeedback } = usePostFeedback({ post });

  const { toggleUpvote, toggleDownvote } = useVotePost();

  return (
    <div className="flex-1 p-6 space-y-4">
      <div className="flex relative justify-between">
        <p className="font-bold typo-callout">Did you like the post?</p>
        <Button
          id="close-engagement-loop-btn"
          className="-top-2.5 -right-2.5 btn-tertiary"
          position="absolute"
          buttonSize={ButtonSize.XSmall}
          icon={<MiniCloseIcon />}
          onClick={dismissFeedback}
        />
      </div>
      <div className="flex gap-3 items-center">
        <Button
          id="upvote-post-btn"
          pressed={post?.userState?.vote === UserPostVote.Up}
          onClick={() => toggleUpvote({ post, origin: Origin.FeedbackCard })}
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserPostVote.Up} />
          }
          aria-label="Upvote"
          className="btn-secondary-avocado"
        />
        <Button
          id="downvote-post-btn"
          pressed={post?.userState?.vote === UserPostVote.Down}
          onClick={() => toggleDownvote({ post, origin: Origin.FeedbackCard })}
          icon={
            <DownvoteIcon
              secondary={post?.userState?.vote === UserPostVote.Down}
            />
          }
          aria-label="Downvote"
          className="btn-secondary-ketchup"
        />
      </div>
    </div>
  );
};
