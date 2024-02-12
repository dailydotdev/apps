import React, { MouseEventHandler, ReactElement } from 'react';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/ButtonV2';
import { DownvoteIcon, UpvoteIcon } from '../../icons';
import { Post, UserPostVote } from '../../../graphql/posts';
import { usePostFeedback } from '../../../hooks';
import CloseButton from '../../CloseButton';
import { cloudinary } from '../../../lib/image';
import { CardContent, CardImage, CardVideoImage } from './Card';

interface FeedbackCardProps {
  post: Post;
  onUpvoteClick: MouseEventHandler;
  onDownvoteClick: MouseEventHandler;
  showImage?: boolean;
  isVideoType?: boolean;
}

export const FeedbackCard = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
  isVideoType,
}: FeedbackCardProps): ReactElement => {
  const { dismissFeedback } = usePostFeedback({ post });
  const ImageComponent = isVideoType ? CardVideoImage : CardImage;

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

      <CardContent className="rounded-14 border border-theme-divider-tertiary p-4">
        <div className="mr-2 flex-1">
          <h2 className="mb-2 line-clamp-1 typo-body">{post.title}</h2>
          {post.summary && (
            <p className=" line-clamp-2 text-theme-label-quaternary typo-callout">
              {post.summary}
            </p>
          )}
        </div>

        <ImageComponent
          alt="Post Cover image"
          src={post.image}
          fallbackSrc={cloudinary.post.imageCoverPlaceholder}
          className="!h-full max-h-[5rem] object-cover"
          loading="lazy"
          data-testid="postImage"
          {...(isVideoType && {
            wrapperClassName: 'mobileXL:w-40 mobileXXL:w-56',
          })}
        />
      </CardContent>
    </div>
  );
};
