import classNames from 'classnames';
import React, { CSSProperties, ReactElement, ReactNode } from 'react';
import { Post } from '../../graphql/posts';
import PostMetadata from '../cards/PostMetadata';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { PostWidgets } from './PostWidgets';
import { TagLinks } from '../TagLinks';
import PostToc from '../widgets/PostToc';
import { PostNavigationProps } from './PostNavigation';
import { PostModalActionsProps } from './PostModalActions';
import { UsePostCommentOptionalProps } from '../../hooks/usePostComment';
import {
  ToastSubject,
  useToastNotification,
} from '../../hooks/useToastNotification';
import PostContentContainer from './PostContentContainer';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import { BasePostContent, PostContentClassName } from './BasePostContent';
import { PostLoadingPlaceholder } from './PostLoadingPlaceholder';
import classed from '../../lib/classed';
import { cloudinary } from '../../lib/image';

export interface PostContentProps
  extends Pick<PostModalActionsProps, 'onClose' | 'inlineActions'>,
    Pick<PostNavigationProps, 'onNextPost' | 'onPreviousPost'>,
    UsePostCommentOptionalProps {
  post?: Post;
  isFallback?: boolean;
  className?: PostContentClassName;
  origin: PostOrigin;
  shouldOnboardAuthor?: boolean;
  isLoading?: boolean;
  customNavigation?: ReactNode;
  position?: CSSProperties['position'];
}

export const SCROLL_OFFSET = 80;
export const ONBOARDING_OFFSET = 120;

const PostContainer = classed(
  'main',
  'flex flex-col flex-1 px-4 tablet:px-8 tablet:border-r tablet:border-theme-divider-tertiary',
);

export function PostContent({
  post,
  className = {},
  shouldOnboardAuthor,
  enableShowShareNewComment,
  origin,
  position,
  inlineActions,
  onPreviousPost,
  onNextPost,
  onClose,
  isLoading,
  isFallback,
  customNavigation,
}: PostContentProps): ReactElement {
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post: post.sharedPost,
  });
  const {
    onSharePost: onShare,
    onReadArticle,
    onToggleBookmark,
  } = engagementActions;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'tablet:pb-0 tablet:flex-row bg-theme-bg-primary',
    className?.container,
  );

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

  if (isLoading) {
    return (
      <PostContentContainer
        hasNavigation={hasNavigation}
        className={containerClass}
      >
        <PostLoadingPlaceholder className="tablet:border-r tablet:border-theme-divider-tertiary" />
      </PostContentContainer>
    );
  }

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
      <PostContainer className={classNames('relative', className?.content)}>
        <BasePostContent
          className={{
            ...className,
            navigation: {
              actions: className?.navigation?.actions,
              container:
                hasNavigation &&
                classNames('pt-6', className?.navigation?.container),
            },
          }}
          isLoading={isLoading}
          isFallback={isFallback}
          enableShowShareNewComment={enableShowShareNewComment}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          <h1
            className="my-6 font-bold break-words typo-large-title"
            data-testid="post-modal-title"
          >
            {post.title}
          </h1>
          {post.summary && (
            <PostSummary className="mb-6" summary={post.summary} />
          )}
          <TagLinks tags={post.tags || []} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            className="mt-4 mb-8"
            typoClassName="typo-callout"
          />
          <a
            href={post.permalink}
            title="Go to article"
            target="_blank"
            rel="noopener"
            onClick={onReadArticle}
            className="block overflow-hidden mb-10 rounded-2xl cursor-pointer"
            style={{ maxWidth: '25.625rem' }}
          >
            <LazyImage
              imgSrc={post.image}
              imgAlt="Post cover image"
              ratio="49%"
              eager
              fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            />
          </a>
          {post.toc?.length > 0 && (
            <PostToc
              post={post}
              collapsible
              className="flex laptop:hidden mt-2 mb-4"
            />
          )}
        </BasePostContent>
      </PostContainer>
      <PostWidgets
        onBookmark={onToggleBookmark}
        onShare={onShare}
        onReadArticle={onReadArticle}
        post={post}
        className="pb-8"
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
}
