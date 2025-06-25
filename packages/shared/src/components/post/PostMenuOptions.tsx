import type {
  KeyboardEventHandler,
  MouseEventHandler,
  ReactElement,
} from 'react';
import React from 'react';
import { MiniCloseIcon as CloseIcon } from '../icons';
import type { Post } from '../../graphql/posts';

import type { Origin } from '../../lib/log';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { Tooltip } from '../tooltip/Tooltip';
import { PostOptionButton } from '../../features/posts/PostOptionButton';

export interface PostMenuOptionsProps {
  post: Post;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  inlineActions?: boolean;
  origin: Origin;
  isEnlarged?: boolean;
}

export function PostMenuOptions({
  post,
  onClose,
  inlineActions,
  origin,
  isEnlarged,
}: PostMenuOptionsProps): ReactElement {
  return (
    <>
      {!inlineActions && <div className="flex-1" />}
      <PostOptionButton
        post={post}
        size={isEnlarged ? ButtonSize.Medium : ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        origin={origin}
      />
      {onClose && (
        <Tooltip side="bottom" content="Close">
          <Button
            size={isEnlarged ? ButtonSize.Medium : ButtonSize.Small}
            variant={ButtonVariant.Tertiary}
            icon={<CloseIcon />}
            onClick={(e) => onClose(e)}
          />
        </Tooltip>
      )}
    </>
  );
}
