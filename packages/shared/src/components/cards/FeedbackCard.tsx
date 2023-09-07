import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import DownvoteIcon from '../icons/Downvote';
import MiniCloseIcon from '../icons/MiniClose';
import UpvoteIcon from '../icons/Upvote';
import { Post, UserPostVote } from '../../graphql/posts';
import { usePostFeedback, useVotePost, mutationHandlers } from '../../hooks';
import useUpdatePost from '../../hooks/useUpdatePost';

interface FeedbackCardProps {
  post: Post;
}

export const FeedbackCard = ({ post }: FeedbackCardProps): ReactElement => {
  const { dismissFeedback } = usePostFeedback({ post });
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

  return (
    <div className="flex-1 p-6 space-y-4">
      <div className="flex justify-between">
        <div className="font-bold typo-Callout">Did you like the post?</div>
        <Button
          id="close-engagement-loop-btn"
          className="relative -top-2.5 -right-2.5"
          buttonSize={ButtonSize.XSmall}
          icon={<MiniCloseIcon />}
          onClick={dismissFeedback}
        />
      </div>
      <div className="flex gap-3 items-center">
        <Button
          id="upvote-post-btn"
          pressed={post?.userState?.vote === UserPostVote.Up}
          onClick={() => toggleUpvote(post)}
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserPostVote.Up} />
          }
          aria-label="Upvote"
          className="btn-secondary"
        />
        <Button
          id="downvote-post-btn"
          pressed={post?.userState?.vote === UserPostVote.Down}
          onClick={() => toggleDownvote(post)}
          icon={
            <DownvoteIcon
              secondary={post?.userState?.vote === UserPostVote.Down}
            />
          }
          aria-label="Downvote"
          className="btn-secondary"
        />
      </div>
    </div>
  );
};
