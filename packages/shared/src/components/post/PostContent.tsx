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
import { PostHeaderActions, PostHeaderActionsProps } from './PostHeaderActions';
import {
  ToastSubject,
  useToastNotification,
} from '../../hooks/useToastNotification';
import PostContentContainer from './PostContentContainer';
import { PostOrigin } from '../../hooks/analytics/useAnalyticsContextData';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import { BasePostContent, PostContentClassName } from './BasePostContent';
import classed from '../../lib/classed';
import { cloudinary } from '../../lib/image';
import { combinedClicks } from '../../lib/click';

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
  postPosition,
  isFallback,
  customNavigation,
  onRemovePost,
  backToSquad,
}: PostContentProps): ReactElement {
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { onSharePost: onShare, onReadArticle } = engagementActions;

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const containerClass = classNames(
    'tablet:pb-0 tablet:flex-row',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onReadArticle,
    onClose,
    onShare,
    inlineActions,
    onRemovePost,
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

      <PostContainer
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
        {!hasNavigation && (
          <PostHeaderActions
            onShare={onShare}
            onReadArticle={onReadArticle}
            post={post}
            onClose={onClose}
            className="flex tablet:hidden mb-4"
            contextMenuId="post-widgets-context"
          />
        )}

        <BasePostContent
          className={{
            ...className,
            onboarding: classNames(
              className?.onboarding,
              backToSquad && 'mb-6',
            ),
            navigation: {
              actions: className?.navigation?.actions,
              container: classNames('pt-6', className?.navigation?.container),
            },
          }}
          isFallback={isFallback}
          customNavigation={customNavigation}
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
            <a
              href={post.permalink}
              title="Go to post"
              target="_blank"
              rel="noopener"
              {...combinedClicks(onReadArticle)}
            >
              {post.title}
            </a>
          </h1>
          {post.summary && (
            <PostSummary className="mb-6" summary={post.summary} />
          )}
          <TagLinks tags={post.tags || []} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            className="mt-4 mb-8 !typo-callout"
          />
          <a
            href={post.permalink}
            title="Go to post"
            target="_blank"
            rel="noopener"
            {...combinedClicks(onReadArticle)}
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
