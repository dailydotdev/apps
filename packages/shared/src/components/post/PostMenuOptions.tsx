import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';

import type { Origin } from '../../lib/log';
import { ButtonSize, ButtonVariant } from '../buttons/Button';
import { PostOptionButton } from '../../features/posts/PostOptionButton';

export interface PostMenuOptionsProps {
  post: Post;
  inlineActions?: boolean;
  origin: Origin;
}

export function PostMenuOptions({
  post,
  inlineActions,
  origin,
}: PostMenuOptionsProps): ReactElement {
  return (
    <>
      {!inlineActions && <div className="flex-1" />}
      <PostOptionButton
        post={post}
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        origin={origin}
      />
    </>
  );
}
