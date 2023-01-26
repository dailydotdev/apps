import classNames from 'classnames';
import dynamic from 'next/dynamic';
import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useEffect,
} from 'react';
import { useQueryClient } from 'react-query';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import {
  PostData,
  POSTS_ENGAGED_SUBSCRIPTION,
  PostsEngaged,
  Post,
} from '../../graphql/posts';
import useSubscription from '../../hooks/useSubscription';
import { postAnalyticsEvent } from '../../lib/feed';
import PostMetadata from '../cards/PostMetadata';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { PostWidgets } from './PostWidgets';
import { TagLinks } from '../TagLinks';
import PostToc from '../widgets/PostToc';
import PostNavigation, {
  PostNavigationClassName,
  PostNavigationProps,
} from './PostNavigation';
import { PostModalActionsProps } from './PostModalActions';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import classed from '../../lib/classed';
import { UsePostCommentOptionalProps } from '../../hooks/usePostComment';
import {
  ToastSubject,
  useToastNotification,
} from '../../hooks/useToastNotification';
import { AnalyticsEvent } from '../../lib/analytics';
import { PostFeedFiltersOnboarding } from './PostFeedFiltersOnboarding';
import useSidebarRendered from '../../hooks/useSidebarRendered';
import AlertContext from '../../contexts/AlertContext';
import OnboardingContext from '../../contexts/OnboardingContext';
import { ExperimentWinner } from '../../lib/featureValues';
import PostEngagements from './PostEngagements';
import PostContentContainer from './PostContentContainer';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';

const SharePostModal = dynamic(
  () => import(/* webpackChunkName: "shareModal" */ '../modals/ShareModal'),
);

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "custom404" */ '../Custom404'),
);

interface ClassName {
  container?: string;
  navigation?: PostNavigationClassName;
  fixedNavigation?: PostNavigationClassName;
}

export interface PostContentProps
  extends Omit<
      PostModalActionsProps,
      'post' | 'onShare' | 'onBookmark' | 'contextMenuId' | 'className'
    >,
    Pick<PostNavigationProps, 'onNextPost' | 'onPreviousPost'>,
    UsePostCommentOptionalProps {
  post?: Post;
  isFallback?: boolean;
  className?: ClassName;
  analyticsOrigin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  isLoading?: boolean;
  position?: CSSProperties['position'];
}

const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-4 tablet:px-8 tablet:border-r tablet:border-theme-divider-tertiary',
);

export const SCROLL_OFFSET = 80;
export const ONBOARDING_OFFSET = 120;

export function PostContent({
  post,
  className = {},
  isFallback,
  shouldOnboardAuthor,
  enableShowShareNewComment,
  isLoading,
  analyticsOrigin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
}: PostContentProps): ReactElement {
  const { id } = post ?? {};

  if (!id && !isFallback && !isLoading) {
    return <Custom404 />;
  }

  const { trackEvent } = useContext(AnalyticsContext);
  const { alerts } = useContext(AlertContext);
  const { onInitializeOnboarding } = useContext(OnboardingContext);
  const { sidebarRendered } = useSidebarRendered();
  const queryClient = useQueryClient();
  const postQueryKey = ['post', id];
  const { subject } = useToastNotification();
  const showMyFeedArticleAnonymous = sidebarRendered && alerts?.filter;
  const { onCloseShare, onReadArticle, onShare, onToggleBookmark, sharePost } =
    usePostContent({ origin: analyticsOrigin, post });

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
      variables: {
        ids: [id],
      },
    }),
    {
      next: (data: PostsEngaged) => {
        if (data.postsEngaged.id === id) {
          queryClient.setQueryData<PostData>(postQueryKey, (oldPost) => ({
            post: {
              ...oldPost.post,
              ...data.postsEngaged,
            },
          }));
        }
      },
    },
  );

  useEffect(() => {
    if (!post) {
      return;
    }

    trackEvent(postAnalyticsEvent(`${analyticsOrigin} view`, post));
  }, [post]);

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'tablet:pb-0 tablet:flex-row',
    className?.container,
  );

  if (isLoading) {
    return (
      <PostContentContainer
        hasNavigation={hasNavigation}
        className={containerClass}
      >
        <PostLoadingPlaceholder />
      </PostContentContainer>
    );
  }

  if (!post) {
    return <Custom404 />;
  }

  const postLinkProps = {
    href: post.permalink,
    title: 'Go to article',
    target: '_blank',
    rel: 'noopener',
    onClick: onReadArticle,
    onMouseUp: (event: React.MouseEvent) =>
      event.button === 1 && onReadArticle(),
  };

  const onInitializeOnboardingClick = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickArticleAnonymousCTA,
      target_id: ExperimentWinner.ArticleOnboarding,
      extra: JSON.stringify({ origin: analyticsOrigin }),
    });
    onInitializeOnboarding();
  };

  const navigationProps: PostNavigationProps = {
    onPreviousPost,
    onNextPost,
    post,
    onBookmark: onToggleBookmark,
    onReadArticle,
    onClose,
    onShare,
    inlineActions,
  };

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
    >
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          className={className?.fixedNavigation}
        />
      )}
      <PostContainer className="relative">
        {showMyFeedArticleAnonymous && (
          <PostFeedFiltersOnboarding
            onInitializeOnboarding={onInitializeOnboardingClick}
          />
        )}
        <PostNavigation
          {...navigationProps}
          className={{
            container: classNames('pt-6', className?.navigation?.container),
            actions: className?.navigation?.actions,
          }}
        />
        <h1
          className="my-6 font-bold break-words typo-large-title"
          data-testid="post-modal-title"
        >
          {post.title}
        </h1>
        {post.summary && <PostSummary summary={post.summary} />}
        <TagLinks tags={post.tags || []} />
        <PostMetadata
          createdAt={post.createdAt}
          readTime={post.readTime}
          className="mt-4 mb-8"
          typoClassName="typo-callout"
        />
        <a
          {...postLinkProps}
          className="block overflow-hidden mb-10 rounded-2xl cursor-pointer"
          style={{ maxWidth: '25.625rem' }}
        >
          <LazyImage
            imgSrc={post.image}
            imgAlt="Post cover image"
            ratio="49%"
            eager
            fallbackSrc="https://res.cloudinary.com/daily-now/image/upload/f_auto/v1/placeholders/1"
          />
        </a>
        {post.toc?.length > 0 && (
          <PostToc
            post={post}
            collapsible
            className="flex laptop:hidden mt-2 mb-4"
          />
        )}
        {post && (
          <PostEngagements
            post={post}
            onShare={onShare}
            onBookmark={onToggleBookmark}
            analyticsOrigin={analyticsOrigin}
            shouldOnboardAuthor={shouldOnboardAuthor}
            enableShowShareNewComment={enableShowShareNewComment}
          />
        )}
      </PostContainer>
      <PostWidgets
        onBookmark={onToggleBookmark}
        onShare={onShare}
        onReadArticle={onReadArticle}
        post={post}
        className="pb-8"
        onClose={onClose}
        origin={analyticsOrigin}
      />
      {sharePost && (
        <SharePostModal
          isOpen={!!sharePost}
          post={post}
          origin={analyticsOrigin}
          onRequestClose={onCloseShare}
        />
      )}
    </PostContentContainer>
  );
}
