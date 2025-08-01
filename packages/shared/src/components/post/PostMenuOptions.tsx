import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import type { ButtonSize } from '../buttons/Button';
import { ButtonVariant } from '../buttons/Button';
import { PostOptionButton } from '../../features/posts/PostOptionButton';

export interface PostMenuOptionsProps {
  post: Post;
  origin: Origin;
  buttonSize?: ButtonSize;
}

export function PostMenuOptions({
  post,
  origin,
  buttonSize,
}: PostMenuOptionsProps): ReactElement {
  return (
    <PostOptionButton
      post={post}
      size={buttonSize}
      variant={ButtonVariant.Tertiary}
      origin={origin}
    />
  );
}
