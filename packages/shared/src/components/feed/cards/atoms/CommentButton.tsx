import React, { ReactElement } from 'react';
import { Post } from '../../../../graphql/posts';
import { QuaternaryButton } from '../../../buttons/QuaternaryButton';
import InteractionCounter from '../../../InteractionCounter';
import { SimpleTooltip } from '../../../tooltips';
import { ButtonSize } from '../../../buttons/Button';
import { useActiveFeedContext } from '../../../../contexts';
import { DiscussIcon as CommentIcon } from '../../../icons';

interface CommentButtonProps {
  post: Post;
}
export function CommentButton({ post }: CommentButtonProps): ReactElement {
  const { items, onOpenModal } = useActiveFeedContext();
  const postIndex = items.findIndex(
    (item) => item.type === 'post' && item.post.id === post.id,
  );
  return (
    <SimpleTooltip content="Comments">
      <QuaternaryButton
        id={`post-${post.id}-comment-btn`}
        icon={<CommentIcon secondary={post.commented} />}
        pressed={post.commented}
        size={ButtonSize.Small}
        onClick={() => onOpenModal(postIndex)}
        className="btn-tertiary-blueCheese w-[4.875rem]"
      >
        <InteractionCounter value={post.numComments > 0 && post.numComments} />
      </QuaternaryButton>
    </SimpleTooltip>
  );
}
