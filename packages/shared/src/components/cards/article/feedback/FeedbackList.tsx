import type { ReactElement } from 'react';
import React from 'react';
import { usePostFeedback } from '../../../../hooks';
import CloseButton from '../../../CloseButton';
import { ButtonSize } from '../../../buttons/common';
import { CardContent } from '../../common/list/ListCard';
import { CardCoverList } from '../../common/list/CardCover';
import type { FeedbackProps } from './common/common';
import { FeedbackButtons } from './common/FeedbackButtons';

export const FeedbackList = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
  isVideoType,
}: FeedbackProps): ReactElement => {
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
      <FeedbackButtons
        post={post}
        onDownvoteClick={onDownvoteClick}
        onUpvoteClick={onUpvoteClick}
      />
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
