import { CSSProperties, ReactNode } from 'react';
import { PostNavigationProps } from './PostNavigation';
import { PostHeaderActionsProps } from './PostHeaderActions';
import { Post } from '../../graphql/posts';
import { PostContentClassName } from './BasePostContent';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import classed from '../../lib/classed';

export type PassedPostNavigationProps = Pick<
  PostNavigationProps,
  'onNextPost' | 'onPreviousPost' | 'postPosition' | 'onRemovePost'
>;

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
