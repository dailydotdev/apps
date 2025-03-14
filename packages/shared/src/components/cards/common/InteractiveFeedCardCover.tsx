import type { ReactElement } from 'react';
import React from 'react';
import { CardCoverContainer } from './CardCoverContainer';
import { IconSize } from '../../Icon';
import { BlockIcon, VIcon } from '../../icons';
import type { Post } from '../../../graphql/posts';
import { useInteractiveFeedContext } from '../../../contexts/InteractiveFeedContext';

const InteractiveFeedCardCover = ({ post }: { post: Post }): ReactElement => {
  const { hidePost, approvePost } = useInteractiveFeedContext();
  return (
    <CardCoverContainer title="">
      <div className="flex gap-2 text-surface-invert">
        <button
          onClick={() => hidePost(post.id)}
          type="button"
          className="flex size-10 items-center justify-center rounded-full bg-status-error"
        >
          <BlockIcon className="m-auto" size={IconSize.Medium} />
        </button>
        <button
          onClick={() => approvePost(post)}
          type="button"
          className="flex h-10 w-10 items-center  justify-center rounded-full bg-action-upvote-default"
        >
          <VIcon size={IconSize.Medium} />
        </button>
      </div>
    </CardCoverContainer>
  );
};

export default InteractiveFeedCardCover;
