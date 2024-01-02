import classNames from 'classnames';
import React, { ReactElement, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isVideoPost, sendViewPost } from '../../graphql/posts';
import PostMetadata from '../cards/PostMetadata';
import PostSummary from '../cards/PostSummary';
import { LazyImage } from '../LazyImage';
import { PostWidgets } from './PostWidgets';
import { TagLinks } from '../TagLinks';
import PostToc from '../widgets/PostToc';
import { PostHeaderActions } from './PostHeaderActions';
import {
  ToastSubject,
  useToastNotification,
} from '../../hooks/useToastNotification';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import { BasePostContent } from './BasePostContent';
import { cloudinary } from '../../lib/image';
import { combinedClicks } from '../../lib/click';
import { PostContainer, PostContentProps, PostNavigationProps } from './common';
import YoutubeVideo from '../video/YoutubeVideo';
import { useAuthContext } from '../../contexts/AuthContext';

export const SCROLL_OFFSET = 80;
export const ONBOARDING_OFFSET = 120;

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
  const { user } = useAuthContext();
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { onSharePost: onShare, onReadArticle } = engagementActions;
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost);

  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const isVideoType = isVideoPost(post);
  const containerClass = classNames(
    'tablet:flex-row tablet:pb-0',
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

  // Only send view post if the post is a video type
  useEffect(() => {
    if (!isVideoType || !post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [isVideoType, onSendViewPost, post.id, user?.id]);

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
            className="mb-4 flex tablet:hidden"
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
            className="my-6 break-words font-bold typo-large-title"
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
          {isVideoType && (
            <YoutubeVideo
              title={post.title}
              videoId={post.videoId}
              className="mb-7"
            />
          )}
          {post.summary && (
            <PostSummary className="mb-6" summary={post.summary} />
          )}
          <TagLinks tags={post.tags || []} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            isVideoType={isVideoType}
            className={classNames(
              'mt-4 !typo-callout',
              isVideoType ? 'mb-4' : 'mb-8',
            )}
          />
          {!isVideoType && (
            <a
              href={post.permalink}
              title="Go to post"
              target="_blank"
              rel="noopener"
              {...combinedClicks(onReadArticle)}
              className="mb-10 block cursor-pointer overflow-hidden rounded-2xl"
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
          )}
          {post.toc?.length > 0 && (
            <PostToc
              post={post}
              collapsible
              className="mb-4 mt-2 flex laptop:hidden"
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
