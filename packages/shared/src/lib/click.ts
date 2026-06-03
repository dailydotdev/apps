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
  event?: React.MouseEvent,
) => Promise<void>;

export const combinedClicks = <T = HTMLAnchorElement>(
  func: React.MouseEventHandler<T>,
): CombinedClicks<T> => {
  return {
    onAuxClick: (event) => event.button === 1 && func(event),
    onClick: func,
  };
};

// When a large surface (e.g. an entire card) is wrapped in a single link,
// users still expect to be able to select text inside it without the click
// navigating away on mouseup. This guard preempts that navigation when the
// click is the tail end of a text selection gesture.
export const withSelectionGuard = <T = HTMLAnchorElement>(
  handler: React.MouseEventHandler<T>,
): React.MouseEventHandler<T> => {
  return (event) => {
    const selection = globalThis?.window?.getSelection();
    const hasSelection =
      !!selection && selection.anchorOffset !== selection.focusOffset;
    if (hasSelection) {
      event.preventDefault();
      return;
    }
    handler(event);
  };
};
