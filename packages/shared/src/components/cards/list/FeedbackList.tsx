import React, { MouseEventHandler, ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { DownvoteIcon, UpvoteIcon } from '../../icons';
import { Post, UserVote } from '../../../graphql/posts';
import { usePostFeedback } from '../../../hooks';
import CloseButton from '../../CloseButton';
import { CardContent } from './ListCard';
import { CardCoverList } from './CardCover';

interface FeedbackCardProps {
  post: Post;
  onUpvoteClick: MouseEventHandler;
  onDownvoteClick: MouseEventHandler;
  isVideoType?: boolean;
}

export const FeedbackList = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
  isVideoType,
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
          className="absolute -right-2 -top-4"
          size={ButtonSize.Small}
          onClick={dismissFeedback}
        />
      </div>
      <div className="relative flex items-center gap-3">
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

      <CardContent className="rounded-14 border border-border-subtlest-tertiary p-4">
        <div className="mr-2 flex-1">
          <h2 className="mb-2 line-clamp-1 typo-body">{post.title}</h2>
        </div>

        <CardCoverList
          data-testid="postImage"
          isVideoType={isVideoType}
          imageProps={{
            loading: 'lazy',
            alt: 'Post Cover image',
            src: post.image,
            className: '!h-full max-h-[5rem]',
          }}
          videoProps={{
            className: 'mobileXL:w-40 mobileXXL:w-56',
          }}
        />
      </CardContent>
    </div>
  );
};
