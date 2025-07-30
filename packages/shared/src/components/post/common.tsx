import type {
  CSSProperties,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
} from 'react';
import type { Post } from '../../graphql/posts';
import type { PostOrigin } from '../../hooks/log/useLogContextData';
import classed from '../../lib/classed';
import type { PostPosition } from '../../hooks/usePostModalNavigation';
import type {
  UsePostContent,
  UsePostContentProps,
} from '../../hooks/usePostContent';
import type { ButtonSize } from '../buttons/common';

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
  'post' | 'onClose' | 'onReadArticle' | 'inlineActions' | 'isFixedNavigation'
>;

export interface PostNavigationClassName {
  container?: string;
  actions?: string;
  title?: string;
}

export interface PostNavigationProps extends Omit<PostActions, 'post'> {
  postPosition?: PostPosition;
  onPreviousPost?: () => unknown;
  onNextPost?: () => unknown;
  className?: PostNavigationClassName;
  isBannerVisible?: boolean;
  contextMenuId?: string;
  post?: Post;
  buttonSize?: ButtonSize;
}

export type PassedPostNavigationProps = Pick<
  PostNavigationProps,
  'onNextPost' | 'onPreviousPost' | 'postPosition' | 'isBannerVisible'
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
  isFixedNavigation?: boolean;
  buttonSize?: ButtonSize;
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
  'flex flex-col flex-1 px-4 tablet:px-6 laptop:px-8 laptop:border-r laptop:border-border-subtlest-tertiary overflow-hidden',
);

export interface BasePostContentProps extends UsePostContentProps {
  post: Post;
  children: ReactNode;
  isFallback?: boolean;
  className?: PostContentClassName;
  navigationProps?: PostNavigationProps;
  engagementProps?: UsePostContent;
  shouldOnboardAuthor?: boolean;
  loadingPlaceholder?: ReactNode;
  customNavigation?: ReactNode;
  isPostPage?: boolean;
}
