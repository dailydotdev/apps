import { HTMLAttributes, ReactHTML } from 'react';
import { Post } from '../../graphql/posts';
import classed, { ClassedHTML } from '../../lib/classed';

export const Separator = classed(
  'div',
  'mx-1 w-0.5 h-0.5 rounded-full bg-theme-label-tertiary',
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

export const Containter = classed('div', 'relative flex flex-1 flex-col');

export type PostCardProps = {
  post: Post;
  onPostClick?: Callback;
  onUpvoteClick?: (post: Post, upvoted: boolean) => unknown;
  onCommentClick?: Callback;
  onBookmarkClick?: (post: Post, bookmarked: boolean) => unknown;
  onMenuClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  onShare?: Callback;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  openNewTab?: boolean;
  enableMenu?: boolean;
  menuOpened?: boolean;
  showImage?: boolean;
  insaneMode?: boolean;
} & HTMLAttributes<HTMLDivElement>;
