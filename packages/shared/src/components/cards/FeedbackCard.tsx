import React, { MouseEventHandler, ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import DownvoteIcon from '../icons/Downvote';
import MiniCloseIcon from '../icons/MiniClose';
import UpvoteIcon from '../icons/Upvote';
import { Post, UserPostVote } from '../../graphql/posts';
import { usePostFeedback } from '../../hooks';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

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
  const feedbackCopy = useFeature(feature.cardFeedbackCopy);

  return (
    <div className="flex-1 p-6 pb-5 space-y-4">
      <div className="flex relative justify-between">
        <p className="font-bold typo-callout">{feedbackCopy}</p>
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
          onClick={onUpvoteClick}
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserPostVote.Up} />
          }
          aria-label="Upvote"
          className="btn-secondary-avocado"
        />
        <Button
          id="downvote-post-btn"
          pressed={post?.userState?.vote === UserPostVote.Down}
          onClick={onDownvoteClick}
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
