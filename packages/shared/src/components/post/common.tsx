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
import type { PostWidgetPosition } from './PostWidgets';

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
  | 'isFixedNavigation'
  | 'hideSubscribeAction'
  | 'hideOptions'
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
  leadingContent?: ReactNode;
  customActions?: ReactNode;
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
  hideSubscribeAction?: boolean;
  /** Hide the "…" options menu (e.g. when it already lives elsewhere). */
  hideOptions?: boolean;
}

export interface PostContentProps
  extends Pick<
      PostHeaderActionsProps,
      'onClose' | 'inlineActions' | 'hideSubscribeAction'
    >,
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
  /**
   * Forwarded to the widget column's per-position ad hook. Only the webapp
   * post page passes it (AdSense units) — post modals and the extension must
   * never, as the ad script only exists on the page and AdSense bans
   * extensions.
   */
  getWidgetRailAd?: (position: PostWidgetPosition) => ReactNode;
  /**
   * Replaces the default TLDR paragraph so an ad template can interleave
   * units between summary segments. Like every ad prop here: only the
   * webapp post page passes it — post modals and the extension render the
   * same component and must never carry ad markup.
   */
  renderSummarySegments?: (summary: string) => ReactNode;
  /** Rendered between the article content and the engagement block. */
  aboveComments?: ReactNode;
  /** Interleaves the comment thread — see PostEngagements. */
  commentAds?: {
    interleaveEvery: number;
    renderInterleaved: (occurrence: number) => ReactNode;
  };
  /**
   * Rendered first in the article column, same page-only rule as
   * getWidgetRailAd. The column's overflow-hidden is relaxed while this is
   * set, because the ad template's leaderboard pins with position: sticky and
   * an overflow-hidden ancestor silently stops it.
   */
  contentLeading?: ReactNode;
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
  aboveComments?: ReactNode;
  commentAds?: {
    interleaveEvery: number;
    renderInterleaved: (occurrence: number) => ReactNode;
  };
  loadingPlaceholder?: ReactNode;
  customNavigation?: ReactNode;
  isPostPage?: boolean;
}
