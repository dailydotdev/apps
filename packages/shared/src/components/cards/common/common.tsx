import type { HTMLAttributes, ReactElement, ReactHTML, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Post } from '../../../graphql/posts';
import type { ClassedHTML } from '../../../lib/classed';
import classed from '../../../lib/classed';
import type { Origin } from '../../../lib/log';

export interface CommonCardCoverProps {
  post?: Post;
  isHoveringCard?: boolean;
  onShare?: (post: Post) => unknown;
}

export const separatorCharacter = <>&#x2022;</>;

export const Separator = ({
  className,
}: {
  className?: string;
}): ReactElement => (
  <span className={classNames('mx-1', className)}>{separatorCharacter}</span>
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

export interface PostCardProps extends CommonCardCoverProps {
  post: Post;
  onPostClick?: Callback;
  onPostAuxClick?: Callback;
  onBookmarkClick?: Callback;
  onUpvoteClick?: (post: Post, origin?: Origin) => unknown;
  onDownvoteClick?: (post: Post, origin?: Origin) => unknown;
  onCommentClick?: Callback;
  onMenuClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  onShare?: Callback;
  onCopyLinkClick?: (event: React.MouseEvent, post: Post) => unknown;
  openNewTab?: boolean;
  enableMenu?: boolean;
  menuOpened?: boolean;
  enableSourceHeader?: boolean;
  children?: ReactNode;
  domProps?: HTMLAttributes<HTMLDivElement>;
  eagerLoadImage?: boolean;
}

interface GenerateTitleClampProps {
  hasImage?: boolean;
  hasHtmlContent?: boolean;
}

export const generateTitleClamp = ({
  hasImage,
  hasHtmlContent,
}: GenerateTitleClampProps = {}): string => {
  if (hasImage) {
    return 'line-clamp-3';
  }

  return hasHtmlContent ? 'line-clamp-4' : 'line-clamp-9';
};

export enum FeedItemType {
  'Post' = 'post',
  'Ad' = 'ad',
  PlusEntry = 'plusEntry',
  Placeholder = 'placeholder',
  UserAcquisition = 'userAcquisition',
  MarketingCta = 'marketingCta',
}
