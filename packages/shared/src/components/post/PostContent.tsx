import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { isVideoPost } from '../../graphql/posts';
import PostMetadata from '../cards/common/PostMetadata';
import { PostWidgets } from './PostWidgets';
import PostToc from '../widgets/PostToc';
import { ToastSubject, useToastNotification } from '../../hooks';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import { combinedClicks } from '../../lib/click';
import type { PostContentProps, PostNavigationProps } from './common';
import { PostContainer } from './common';
import YoutubeVideo from '../video/YoutubeVideo';
import { useAuthContext } from '../../contexts/AuthContext';
import { useViewPost } from '../../hooks/post';
import { TruncateText } from '../utilities';
import { useFeature } from '../GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { motion } from 'framer-motion';
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { withPostById } from './withPostById';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { SmartPrompt } from './smartPrompts/SmartPrompt';
import { PostTagList } from './tags/PostTagList';
import PostSourceInfo from './PostSourceInfo';

export const SCROLL_OFFSET = 80;

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ './PostCodeSnippets').then(
    (mod) => mod.PostCodeSnippets,
  ),
);

const SHARED_TRANSITION = { type: 'spring', stiffness: 400, damping: 35 };

export function PostContentRaw({
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
  const onSendViewPost = useViewPost();
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const { title } = useSmartTitle(post);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const isVideoType = isVideoPost(post);
  const isCompactModalSpacing = !isPostPage;
  let metadataMarginClassName = 'mb-8';
  if (isVideoType) {
    metadataMarginClassName = isCompactModalSpacing ? 'mb-3' : 'mb-4';
  } else if (isCompactModalSpacing) {
    metadataMarginClassName = 'mb-6';
  }
  const metadataClassName = classNames(
    isCompactModalSpacing ? 'mt-3 !typo-callout' : 'mt-4 !typo-callout',
    metadataMarginClassName,
  );
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
              className: {
                ...className?.fixedNavigation,
                container: classNames(
                  className?.fixedNavigation?.container,
                  isPostPage && 'tablet:max-w-[calc(100%-4rem)]',
                ),
              },
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
          <div className={isCompactModalSpacing ? 'my-4' : 'my-6'}>
            <motion.div layoutId={`post-author-${post.id}`} transition={SHARED_TRANSITION}>
              <PostSourceInfo
                className="mb-3"
                post={post}
                onClose={onClose}
                onReadArticle={onReadArticle}
              />
            </motion.div>
            <motion.h1
              layoutId={`post-title-${post.id}`}
              transition={SHARED_TRANSITION}
              className="break-words font-bold typo-large-title"
              data-testid="post-modal-title"
            >
              <ArticleLink>{title}</ArticleLink>
            </motion.h1>
            {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
          </div>
          {isVideoType && (
            <YoutubeVideo
              placeholderProps={{ post, onWatchVideo: onReadArticle }}
              videoId={post.videoId}
              className="mb-7"
            />
          )}
          {post.summary && (
            <SmartPrompt
              post={post}
              className={isCompactModalSpacing ? 'mb-4 gap-2' : undefined}
            />
          )}
          <PostTagList post={post} />
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            isVideoType={isVideoType}
            className={metadataClassName}
            domain={
              !isVideoType &&
              post.domain?.length > 0 && (
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
            <motion.div layoutId={`post-cover-${post.id}`} transition={SHARED_TRANSITION}>
              <ArticleLink
                className={classNames(
                  'block cursor-pointer overflow-hidden rounded-16',
                  isCompactModalSpacing ? 'mb-4' : 'mb-10',
                )}
                style={{ maxWidth: '25.625rem' }}
              >
                <LazyImage
                  imgSrc={post.image}
                  imgAlt="Post cover image"
                  ratio="49%"
                  eager
                  fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                  fetchPriority="high"
                />
              </ArticleLink>
            </motion.div>
          )}
          {post.toc?.length > 0 && (
            <PostToc
              post={post}
              collapsible
              className="mb-4 mt-2 flex laptop:hidden"
            />
          )}
          {showCodeSnippets && (
            <PostCodeSnippets
              className={isCompactModalSpacing ? 'mb-4' : 'mb-6'}
              post={post}
            />
          )}
        </BasePostContent>
      </PostContainer>
      <PostWidgets
        onReadArticle={onReadArticle}
        post={post}
        className="!gap-2 pb-8 pt-4"
        onClose={onClose}
        origin={origin}
        onCopyPostLink={onCopyPostLink}
      />
    </PostContentContainer>
  );
}

export const PostContent = withPostById(PostContentRaw);
