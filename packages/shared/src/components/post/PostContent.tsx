import classNames from 'classnames';
import React, { ComponentProps, ReactElement, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { isVideoPost } from '../../graphql/posts';
import PostMetadata from '../cards/common/PostMetadata';
import PostSummary from '../cards/common/PostSummary';
import { PostWidgets } from './PostWidgets';
import { TagLinks } from '../TagLinks';
import PostToc from '../widgets/PostToc';
import { ToastSubject, useToastNotification } from '../../hooks';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import { combinedClicks } from '../../lib/click';
import { PostContainer, PostContentProps, PostNavigationProps } from './common';
import YoutubeVideo from '../video/YoutubeVideo';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewPost } from '../../hooks/post';
import { TruncateText } from '../utilities';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { LazyImage } from '../LazyImage';

export const SCROLL_OFFSET = 80;
export const ONBOARDING_OFFSET = 120;

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ './PostCodeSnippets').then(
    (mod) => mod.PostCodeSnippets,
  ),
);

export function PostContent({
  post,
  className = {},
  shouldOnboardAuthor,
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
  isBannerVisible,
  isPostPage,
}: PostContentProps): ReactElement {
  const { user } = useAuthContext();
  const { subject } = useToastNotification();
  const engagementActions = usePostContent({
    origin,
    post,
  });
  const { onCopyPostLink, onReadArticle } = engagementActions;
  const onSendViewPost = useViewPost(post);
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const isVideoType = isVideoPost(post);
  const containerClass = classNames(
    'laptop:flex-row laptop:pb-0',
    className?.container,
  );

  const navigationProps: PostNavigationProps = {
    postPosition,
    onPreviousPost,
    onNextPost,
    post,
    onReadArticle,
    onClose,
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

  const ArticleLink = ({ children, ...props }: ComponentProps<'a'>) => {
    return (
      <a
        href={post.permalink}
        title="Go to post"
        target="_blank"
        rel="noopener"
        {...combinedClicks(onReadArticle)}
        {...props}
      >
        {children}
      </a>
    );
  };

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible,
              className: className?.fixedNavigation,
            }
          : null
      }
    >
      <PostContainer
        className={classNames('relative', className?.content)}
        data-testid="postContainer"
      >
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
          isPostPage={isPostPage}
          isFallback={isFallback}
          customNavigation={customNavigation}
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
            <ArticleLink>{post.title}</ArticleLink>
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
            domain={
              !isVideoType &&
              post.domain.length > 0 && (
                <TruncateText>
                  From{' '}
                  <ArticleLink title={post.domain} className="hover:underline">
                    {post.domain}
                  </ArticleLink>
                </TruncateText>
              )
            }
          />
          {!isVideoType && (
            <ArticleLink
              className="mb-10 block cursor-pointer overflow-hidden rounded-16"
              style={{ maxWidth: '25.625rem' }}
            >
              <LazyImage
                imgSrc={post.image}
                imgAlt="Post cover image"
                ratio="49%"
                eager
                fetchpriority="high"
                width={410}
                height={201}
              />
            </ArticleLink>
          )}
          {post.toc?.length > 0 && (
            <PostToc
              post={post}
              collapsible
              className="mb-4 mt-2 flex laptop:hidden"
            />
          )}
          {showCodeSnippets && (
            <PostCodeSnippets className="mb-6" post={post} />
          )}
        </BasePostContent>
      </PostContainer>
      <PostWidgets
        onReadArticle={onReadArticle}
        post={post}
        className="pb-8"
        onClose={onClose}
        origin={origin}
        onCopyPostLink={onCopyPostLink}
      />
    </PostContentContainer>
  );
}
