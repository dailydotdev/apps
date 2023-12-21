import {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
} from 'react';
import { Post } from '../../graphql/posts';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import classed from '../../lib/classed';
import { ShareBookmarkProps } from './PostActions';
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
}

type PostActions = Pick<
  PostHeaderActionsProps,
  | 'post'
  | 'onClose'
  | 'onShare'
  | 'onReadArticle'
  | 'inlineActions'
  | 'onRemovePost'
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
}

export type PassedPostNavigationProps = Pick<
  PostNavigationProps,
  'onNextPost' | 'onPreviousPost' | 'postPosition' | 'onRemovePost'
>;

export interface PostHeaderActionsProps extends ShareBookmarkProps {
  post: Post;
  onReadArticle?: () => void;
  onClose?: MouseEventHandler | KeyboardEventHandler;
  className?: string;
  style?: CSSProperties;
  inlineActions?: boolean;
  notificationClassName?: string;
  contextMenuId: string;
  onRemovePost?: PostOptionsMenuProps['onRemovePost'];
}

export interface PostContentProps
  extends Pick<PostHeaderActionsProps, 'onClose' | 'inlineActions'>,
    PassedPostNavigationProps {
  enableShowShareNewComment?: boolean;
  post?: Post;
  isFallback?: boolean;
  className?: PostContentClassName;
  origin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  customNavigation?: ReactNode;
  position?: CSSProperties['position'];
  backToSquad?: boolean;
}

export const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-4 tablet:px-8 tablet:border-r tablet:border-theme-divider-tertiary',
);

export interface BasePostContentProps extends UsePostContentProps {
  post: Post;
  children: ReactNode;
  isFallback?: boolean;
  className?: PostContentClassName;
  navigationProps?: PostNavigationProps;
  engagementProps: UsePostContent;
  shouldOnboardAuthor?: boolean;
  enableShowShareNewComment?: boolean;
  loadingPlaceholder?: ReactNode;
  customNavigation?: ReactNode;
}
