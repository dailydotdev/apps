import React, { MouseEventHandler, ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/ButtonV2';
import DownvoteIcon from '../../icons/Downvote';
import UpvoteIcon from '../../icons/Upvote';
import { Post, UserPostVote } from '../../../graphql/posts';
import { usePostFeedback } from '../../../hooks';
import CloseButton from '../../CloseButton';
// import { PostCardFooter } from './PostCardFooter';

interface FeedbackCardProps {
  post: Post;
  onUpvoteClick: MouseEventHandler;
  onDownvoteClick: MouseEventHandler;
  showImage?: boolean;
}

export const FeedbackCard = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
  showImage = true,
}: FeedbackCardProps): ReactElement => {
  const { dismissFeedback } = usePostFeedback({ post });

  return (
    <div className="flex-1 space-y-4">
      <div className="relative flex justify-between">
        <p className="font-bold typo-callout">
          Want to see more posts like this?
        </p>
        <CloseButton
          id="close-engagement-loop-btn"
          className="absolute -right-2.5 -top-2.5"
          size={ButtonSize.XSmall}
          onClick={dismissFeedback}
        />
      </div>
      <div className="relative flex items-center gap-3">
        <Button
          id="upvote-post-btn"
          pressed={post?.userState?.vote === UserPostVote.Up}
          onClick={onUpvoteClick}
          icon={
            <UpvoteIcon secondary={post?.userState?.vote === UserPostVote.Up} />
          }
          variant={ButtonVariant.Secondary}
          color={ButtonColor.Avocado}
          aria-label="Upvote"
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
          variant={ButtonVariant.Secondary}
          color={ButtonColor.Ketchup}
          aria-label="Downvote"
        />
      </div>
      <div className="rounded-14 border border-theme-divider-tertiary p-4">
        <h2 className="line-clamp-1 typo-body">{post.title}</h2>
        {post.summary && (
          <p className="mt-2 line-clamp-2 text-theme-label-quaternary typo-callout">
            {post.summary}
          </p>
        )}
        {/* <PostCardFooter */}
        {/*  className={{ */}
        {/*    image: 'mb-0', */}
        {/*  }} */}
        {/*  post={post} */}
        {/*  showImage={showImage} */}
        {/*  insaneMode={false} */}
        {/*  openNewTab */}
        {/* /> */}
      </div>
    </div>
  );
};
