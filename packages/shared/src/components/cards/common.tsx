import React, {
  HTMLAttributes,
  ReactElement,
  ReactHTML,
  ReactNode,
} from 'react';
import { Post } from '../../graphql/posts';
import classed, { ClassedHTML } from '../../lib/classed';
import { Origin } from '../../lib/log';

export interface CommonCardCoverProps {
  post?: Post;
  onShare?: (post: Post) => unknown;
}

export const separatorCharacter = <>&#x2022;</>;

export const Separator = (): ReactElement => (
  <span className="mx-1">{separatorCharacter}</span>
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
  Placeholder = 'placeholder',
  UserAcquisition = 'userAcquisition',
  PublicSquadEligibility = 'publicSquadEligibility',
  MarketingCta = 'marketingCta',
}
