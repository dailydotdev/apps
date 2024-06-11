import {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
} from 'react';
import { Post } from '../../graphql/posts';
import { PostOrigin } from '../../hooks/log/useLogContextData';
import classed from '../../lib/classed';
import { PostOptionsMenuProps } from '../PostOptionsMenu';
import { PostPosition } from '../../hooks/usePostModalNavigation';
import {
  UsePostContent,
  UsePostContentProps,
} from '../../hooks/usePostContent';

export interface PostContentClassName {
  container?: string;
  content?: string;
  onboarding?: string;
  navigation?: PostNavigationClassName;
  fixedNavigation?: PostNavigationClassName;
  header?: string;
}

type PostActions = Pick<
  PostHeaderActionsProps,
  | 'post'
  | 'onClose'
  | 'onReadArticle'
  | 'inlineActions'
  | 'onRemovePost'
  | 'isFixedNavigation'
>;

export interface PostNavigationClassName {
  container?: string;
  actions?: string;
  title?: string;
}

export interface PostNavigationProps extends PostActions {
  postPosition?: PostPosition;
  onPreviousPost?: () => unknown;
  onNextPost?: () => unknown;
  className?: PostNavigationClassName;
  children?: ReactNode;
  isBannerVisible?: boolean;
  contextMenuId?: string;
}

export type PassedPostNavigationProps = Pick<
  PostNavigationProps,
  | 'onNextPost'
  | 'onPreviousPost'
  | 'postPosition'
  | 'onRemovePost'
  | 'isBannerVisible'
>;

export interface PostHeaderActionsProps {
  post: Post;
  onReadArticle?: () => void;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  notificationClassName?: string;
  contextMenuId: string;
  onRemovePost?: PostOptionsMenuProps['onRemovePost'];
  isFixedNavigation?: boolean;
}

export interface PostContentProps
  extends Pick<PostHeaderActionsProps, 'onClose' | 'inlineActions'>,
    PassedPostNavigationProps {
  post?: Post;
  isFallback?: boolean;
  className?: PostContentClassName;
  origin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  customNavigation?: ReactNode;
  position?: CSSProperties['position'];
  backToSquad?: boolean;
  isPostPage?: boolean;
}

export const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-4 laptop:px-8 laptop:border-r laptop:border-border-subtlest-tertiary',
);

export interface BasePostContentProps extends UsePostContentProps {
  post: Post;
  children: ReactNode;
  isFallback?: boolean;
  className?: PostContentClassName;
  navigationProps?: PostNavigationProps;
  engagementProps: UsePostContent;
  shouldOnboardAuthor?: boolean;
  loadingPlaceholder?: ReactNode;
  customNavigation?: ReactNode;
  isPostPage?: boolean;
}
