import React, {
  HTMLAttributes,
  ReactElement,
  ReactHTML,
  ReactNode,
} from 'react';
import { Post } from '../../graphql/posts';
import classed, { ClassedHTML } from '../../lib/classed';
import { Origin } from '../../lib/analytics';

export const Separator = (): ReactElement => (
  <span className="mx-1">&#x2022;</span>
);

export const visibleOnGroupHover =
  'laptop:mouse:invisible laptop:mouse:group-hover:visible';

export const getGroupedHoverContainer = <
  P extends HTMLAttributes<T>,
  T extends HTMLElement,
>(
  type: keyof ReactHTML = 'div',
): ClassedHTML<P, T> => classed<P, T>(type, visibleOnGroupHover);

export type Callback = (post: Post) => unknown;

export const Container = classed('div', 'relative flex flex-1 flex-col');

export interface PostCardProps {
  post: Post;
  onPostClick?: Callback;
  onUpvoteClick?: (post: Post, origin?: Origin) => unknown;
  onDownvoteClick?: (post: Post, origin?: Origin) => unknown;
  onCommentClick?: Callback;
  onMenuClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  onShare?: Callback;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  openNewTab?: boolean;
  enableMenu?: boolean;
  menuOpened?: boolean;
  showImage?: boolean;
  insaneMode?: boolean;
  enableSourceHeader?: boolean;
  children?: ReactNode;
  domProps?: HTMLAttributes<HTMLDivElement>;
}
