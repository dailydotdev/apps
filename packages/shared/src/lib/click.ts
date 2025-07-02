import type React from 'react';
import type { Post } from '../graphql/posts';

export interface CombinedClicks<T = HTMLAnchorElement> {
  onAuxClick: React.MouseEventHandler<T>;
  onClick: React.MouseEventHandler<T>;
}

interface PostClickProps {
  post: Post;
  index: number;
  row: number;
  column: number;
  isAuxClick?: boolean;
  isAdPost?: boolean;
}

export type PostClick = (props: PostClickProps) => Promise<void>;

export const combinedClicks = <T = HTMLAnchorElement>(
  func: React.MouseEventHandler<T>,
): CombinedClicks<T> => {
  return {
    onAuxClick: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};
