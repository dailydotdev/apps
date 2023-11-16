import React, { ReactElement } from 'react';
import { Post, UserPostVote } from '../../../../graphql/posts';
import { QuaternaryButton } from '../../../buttons/QuaternaryButton';
import UpvoteIcon from '../../../icons/Upvote';
import InteractionCounter from '../../../InteractionCounter';
import { SimpleTooltip } from '../../../tooltips';
import CommentIcon from '../../../icons/Discuss';

interface CommentButtonProps {
  post: Post;
}
export function CommentButton({ post }: CommentButtonProps): ReactElement {
  return (
    <SimpleTooltip content="Comments">
      <QuaternaryButton
        id={`post-${post.id}-comment-btn`}
        icon={<CommentIcon secondary={post.commented} />}
        pressed={post.commented}
        onClick={() => {}}
        className="btn-tertiary-blueCheese w-[4.875rem]"
      >
        <InteractionCounter value={post.numComments > 0 && post.numComments} />
      </QuaternaryButton>
    </SimpleTooltip>
  );
}
