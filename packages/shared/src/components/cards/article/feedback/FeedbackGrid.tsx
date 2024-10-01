import React, { ReactElement } from 'react';
import { usePostFeedback } from '../../../../hooks';
import CloseButton from '../../../CloseButton';
import { ButtonSize } from '../../../buttons/common';
import { FeedbackProps } from './common/common';
import { FeedbackButtons } from './common/FeedbackButtons';

export const FeedbackGrid = ({
  post,
  onUpvoteClick,
  onDownvoteClick,
}: FeedbackProps): ReactElement => {
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
      <FeedbackButtons
        post={post}
        onDownvoteClick={onDownvoteClick}
        onUpvoteClick={onUpvoteClick}
      />
    </div>
  );
};
