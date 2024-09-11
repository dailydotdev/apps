import React from 'react';
import { Post } from '../graphql/posts';

export interface CombinedClicks {
  onAuxClick: React.MouseEventHandler<HTMLAnchorElement>;
  onClick: React.MouseEventHandler<HTMLAnchorElement>;
}

export type PostClick = (
  post: Post,
  index: number,
  row: number,
  column: number,
  isAuxClick?: boolean,
) => Promise<void>;

export const combinedClicks = (
  func: React.MouseEventHandler,
): CombinedClicks => {
  return {
    onAuxClick: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};
