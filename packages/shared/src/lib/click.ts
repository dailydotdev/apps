import type React from 'react';
import type { Post } from '../graphql/posts';

export interface CombinedClicks<T = HTMLAnchorElement> {
  onAuxClick: React.MouseEventHandler<T>;
  onClick: React.MouseEventHandler<T>;
}

export type PostClick = (
  post: Post,
  index: number,
  row: number,
  column: number,
  isAuxClick?: boolean,
) => Promise<void>;

export const combinedClicks = <T = HTMLAnchorElement>(
  func: React.MouseEventHandler<T>,
): CombinedClicks<T> => {
  return {
    onAuxClick: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};
