import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Post } from '../../graphql/posts';
import { isVideoPost, PostType } from '../../graphql/posts';
import { isEmbeddableSiteTarget } from '../../features/extensionEmbed/common';
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
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { withPostById } from './withPostById';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { SmartPrompt } from './smartPrompts/SmartPrompt';
import { PostTagList } from './tags/PostTagList';
import PostSourceInfo from './PostSourceInfo';
import { PostArticlePreviewEmbed } from './PostArticlePreviewEmbed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EarthIcon, MiniCloseIcon } from '../icons';

type PostContentRawProps = Omit<PostContentProps, 'post'> & { post: Post };

export const SCROLL_OFFSET = 80;

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ './PostCodeSnippets').then(
    (mod) => mod.PostCodeSnippets,
  ),
);

export function PostContentRaw({
  post,
  className = {},
  shouldOnboardAuthor,
  origin,
  position,
  inlineActions,
  hideSubscribeAction,
  onPreviousPost,
  onNextPost,
  onClose,
  postPosition,
  isFallback,
  customNavigation,
  backToSquad,
  isBannerVisible,
  isPostPage,
}: PostContentRawProps): ReactElement {
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
  const hasToc = (post.toc?.length ?? 0) > 0;
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
  const embedArticleTargetUrl =
    post.permalink && isEmbeddableSiteTarget(post.permalink)
      ? post.permalink
      : null;

  const showArticlePreviewEmbed =
    !isPostPage &&
    !isVideoType &&
    post.type === PostType.Article &&
    embedArticleTargetUrl !== null;

  const [isArticlePreviewDismissed, setArticlePreviewDismissed] =
    useState(false);
  const [isArticlePreviewUnavailable, setArticlePreviewUnavailable] =
    useState(false);

  useEffect(() => {
    setArticlePreviewDismissed(false);
    setArticlePreviewUnavailable(false);
  }, [post.id]);

  const showArticlePreviewColumn =
    showArticlePreviewEmbed && !isArticlePreviewDismissed;

  const onToggleArticlePreview = useCallback(() => {
    setArticlePreviewDismissed((currentState) => !currentState);
  }, []);

  const onPreviewUnavailable = useCallback(() => {
    setArticlePreviewUnavailable(true);
    setArticlePreviewDismissed(true);
  }, []);

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
    hideSubscribeAction,
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

  const postMainColumn = (
    <PostContainer
      className={classNames(
        'relative',
        className?.content,
        showArticlePreviewColumn &&
          'laptop:max-w-[22rem] laptop:!flex-none laptop:overflow-y-auto laptop:overscroll-y-contain',
      )}
      data-testid="postContainer"
    >
      <BasePostContent
        className={{
          ...className,
          onboarding: classNames(className?.onboarding, backToSquad && 'mb-6'),
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
          <PostSourceInfo
            className="mb-3"
            post={post}
            onClose={onClose}
            onReadArticle={onReadArticle}
            hideSubscribeAction={hideSubscribeAction}
          />
          <h1
            className="break-words font-bold typo-large-title"
            data-testid="post-modal-title"
          >
            <ArticleLink>{title}</ArticleLink>
          </h1>
          {post.clickbaitTitleDetected && <PostClickbaitShield post={post} />}
        </div>
        {isVideoType && (
          <YoutubeVideo
            placeholderProps={{ post, onWatchVideo: onReadArticle }}
            videoId={post.videoId ?? ''}
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
          showBelowThresholdLabel={false}
          className={metadataClassName}
          domain={
            !isVideoType &&
            post.domain &&
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
            className={classNames(
              'block cursor-pointer overflow-hidden rounded-16',
              isCompactModalSpacing || hasToc ? 'mb-4' : 'mb-10',
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
        )}
        {hasToc && (
          <PostToc
            post={post}
            collapsible
            className="mb-4 flex laptop:hidden"
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
  );

  const postWidgetsColumn = (
    <PostWidgets
      onReadArticle={onReadArticle}
      post={post}
      className="!gap-2 pb-8 pt-4 laptop:border-l laptop:border-border-subtlest-tertiary"
      onClose={onClose}
      origin={origin}
      onCopyPostLink={onCopyPostLink}
    />
  );

  const articlePreviewToggleTab = showArticlePreviewEmbed ? (
    <div className="relative hidden laptop:flex laptop:min-h-0 laptop:w-0 laptop:flex-none">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Primary}
        className="z-30 absolute right-0 top-4 !rounded-r-none"
        onClick={onToggleArticlePreview}
        icon={showArticlePreviewColumn ? <MiniCloseIcon /> : <EarthIcon />}
        title={
          showArticlePreviewColumn
            ? 'Hide inline article preview'
            : 'Show inline article preview'
        }
        aria-label={
          showArticlePreviewColumn
            ? 'Hide inline article preview'
            : 'Show inline article preview'
        }
      />
    </div>
  ) : null;

  return (
    <PostContentContainer
      hasNavigation={hasNavigation}
      className={containerClass}
      aria-live={subject === ToastSubject.PostContent ? 'polite' : 'off'}
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible: !!isBannerVisible,
              className: {
                ...className?.fixedNavigation,
                container: classNames(
                  className?.fixedNavigation?.container,
                  isPostPage && 'tablet:max-w-[calc(100%-4rem)]',
                ),
              },
            }
          : undefined
      }
    >
      {showArticlePreviewEmbed ? (
        <div className="flex w-full min-w-0 flex-col laptop:min-h-0 laptop:flex-1 laptop:flex-row laptop:items-stretch">
          {postMainColumn}
          {articlePreviewToggleTab}
          {showArticlePreviewColumn ? (
            <PostArticlePreviewEmbed
              targetUrl={embedArticleTargetUrl}
              previewHost={post.domain ?? undefined}
              onDismissArticlePreview={onToggleArticlePreview}
              onPreviewUnavailable={onPreviewUnavailable}
              forceUnavailable={isArticlePreviewUnavailable}
            />
          ) : null}
          {postWidgetsColumn}
        </div>
      ) : (
        <>
          {postMainColumn}
          {postWidgetsColumn}
        </>
      )}
    </PostContentContainer>
  );
}

export const PostContent = withPostById(PostContentRaw);
