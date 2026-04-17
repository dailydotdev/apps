import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Post } from '../../graphql/posts';
import { isVideoPost, PostType } from '../../graphql/posts';
import { isEmbeddableSiteTarget } from '../../features/extensionEmbed/common';
import PostMetadata from '../cards/common/PostMetadata';
import { PostWidgets } from './PostWidgets';
import PostToc from '../widgets/PostToc';
import {
  ToastSubject,
  useToastNotification,
  useViewSize,
  ViewSize,
} from '../../hooks';
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
import { Drawer } from '../drawers/Drawer';
import {
  FloatingPreviewPhase,
  useArticlePreviewPanel,
} from '../../hooks/post/useArticlePreviewPanel';

type PostContentRawProps = Omit<PostContentProps, 'post'> & { post: Post };

export const SCROLL_OFFSET = 80;

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ './PostCodeSnippets').then(
    (mod) => mod.PostCodeSnippets,
  ),
);

const ArticleLink = ({ onClick, children, ...props }: ComponentProps<'a'>) => {
  return (
    <a
      title="Go to post"
      target="_blank"
      rel="noopener"
      {...props}
      {...(onClick ? combinedClicks<HTMLAnchorElement>(onClick) : {})}
    >
      {children}
    </a>
  );
};

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
  const isTablet = useViewSize(ViewSize.Tablet);
  const isLaptop = useViewSize(ViewSize.Laptop);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const isVideoType = isVideoPost(post);
  const hasToc = (post.toc?.length ?? 0) > 0;
  const isCompactModalSpacing = !isPostPage;
  const [isPreviewHydrated, setIsPreviewHydrated] = useState(false);
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
    isPreviewHydrated &&
    !isVideoType &&
    post.type === PostType.Article &&
    embedArticleTargetUrl !== null;

  useEffect(() => {
    setIsPreviewHydrated(true);
  }, []);

  const previewPanel = useArticlePreviewPanel({
    postId: post.id,
    isEnabled: showArticlePreviewEmbed,
    isTablet,
    isLaptop,
  });
  const {
    layoutRef: previewLayoutRef,
    columnRef: previewColumnRef,
    isUnavailable: isArticlePreviewUnavailable,
    isMobileOpen: isMobilePreviewOpen,
    isPreviewFloating,
    floatingPhase,
    isTabletToggling: isTabletPreviewToggling,
    shouldShowColumn: showArticlePreviewColumn,
    toggle: onToggleArticlePreview,
    markUnavailable: onPreviewUnavailable,
    closeMobile,
  } = previewPanel;

  const shouldRenderFloatingPreview =
    floatingPhase !== FloatingPreviewPhase.Hidden || isPreviewFloating;
  const isPreviewActive = isTablet
    ? showArticlePreviewColumn
    : isMobilePreviewOpen;
  const previewEmbedProps = {
    targetUrl: embedArticleTargetUrl ?? '',
    previewHost: post.domain ?? undefined,
    onPreviewUnavailable,
    forceUnavailable: isArticlePreviewUnavailable,
  };

  let previewGridCols = 'grid-cols-[1fr_0px_0fr]';
  if (showArticlePreviewColumn && isTablet) {
    if (!isLaptop) {
      previewGridCols = 'grid-cols-[1fr_0px_1fr]';
    } else if (!isPreviewFloating) {
      previewGridCols = 'grid-cols-[22rem_0px_1fr]';
    }
  }

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

  const postMainColumn = (
    <PostContainer
      className={classNames('relative', className?.content)}
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
          <div className="mb-3 flex items-center">
            <PostSourceInfo
              className="min-w-0 flex-1"
              post={post}
              onClose={onClose}
              onReadArticle={onReadArticle}
              hideSubscribeAction={hideSubscribeAction}
            />
            {!isTablet && showArticlePreviewEmbed && (
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className="ml-auto shrink-0"
                onClick={onToggleArticlePreview}
                icon={<EarthIcon />}
                title="Preview article"
                aria-label="Preview article"
              />
            )}
          </div>
          <h1
            className="break-words font-bold typo-large-title"
            data-testid="post-modal-title"
          >
            <ArticleLink href={post.permalink} onClick={onReadArticle}>
              {title}
            </ArticleLink>
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
          className={metadataClassName}
          domain={
            !isVideoType &&
            post.domain &&
            post.domain.length > 0 && (
              <TruncateText>
                From{' '}
                <ArticleLink
                  href={post.permalink}
                  onClick={onReadArticle}
                  title={post.domain}
                  className="hover:underline"
                >
                  {post.domain}
                </ArticleLink>
              </TruncateText>
            )
          }
        />
        {!isVideoType && (
          <ArticleLink
            href={post.permalink}
            onClick={onReadArticle}
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
      className={classNames(
        '!gap-2 pb-8 pt-4',
        showArticlePreviewEmbed && !isLaptop
          ? 'border-t border-border-subtlest-tertiary'
          : 'tablet:border-l tablet:border-border-subtlest-tertiary',
      )}
      onClose={onClose}
      origin={origin}
      onCopyPostLink={onCopyPostLink}
    />
  );

  const mobilePreviewDrawer = showArticlePreviewEmbed ? (
    <Drawer
      isOpen={!isTablet && isMobilePreviewOpen}
      onClose={closeMobile}
      className={{
        wrapper: 'h-[88vh]',
        drawer: 'flex-1 !p-0',
      }}
      displayCloseButton
      appendOnRoot
    >
      {!isTablet && isMobilePreviewOpen && (
        <PostArticlePreviewEmbed {...previewEmbedProps} className="!flex" />
      )}
    </Drawer>
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
      {showArticlePreviewEmbed && isTablet ? (
        <div
          ref={previewLayoutRef}
          className="relative flex w-full flex-1 items-stretch"
        >
          <div
            className={classNames(
              'grid min-w-0 flex-1 transition-[grid-template-columns] duration-300 ease-in-out',
              previewGridCols,
            )}
          >
            <div className="flex min-w-0 flex-col">
              {postMainColumn}
              {!isLaptop && postWidgetsColumn}
            </div>
            <div className="relative hidden tablet:block">
              <Button
                type="button"
                size={ButtonSize.Small}
                variant={ButtonVariant.Primary}
                className={classNames(
                  'z-30 absolute right-0 !rounded-r-none',
                  isPostPage ? 'top-[4.5rem] laptop:top-6' : 'top-4',
                )}
                onClick={onToggleArticlePreview}
                icon={isPreviewActive ? <MiniCloseIcon /> : <EarthIcon />}
                title={
                  isPreviewActive
                    ? 'Hide inline article preview'
                    : 'Show inline article preview'
                }
                aria-label={
                  isPreviewActive
                    ? 'Hide inline article preview'
                    : 'Show inline article preview'
                }
              />
            </div>
            <div
              ref={previewColumnRef}
              className={classNames(
                'flex min-w-0 flex-col transition-opacity duration-200 ease-in-out [overflow-x:clip]',
                isPostPage
                  ? 'min-h-[calc(100vh-4rem)]'
                  : 'min-h-[calc(100vh-8rem)]',
                showArticlePreviewColumn &&
                  !isPreviewFloating &&
                  !isTabletPreviewToggling
                  ? 'opacity-100 delay-100'
                  : 'opacity-0',
              )}
            >
              {!isPreviewFloating && !isTabletPreviewToggling && (
                <PostArticlePreviewEmbed {...previewEmbedProps} />
              )}
            </div>
          </div>
          {isLaptop && postWidgetsColumn}
          {shouldRenderFloatingPreview && (
            <div
              className={classNames(
                'absolute right-0 top-0 z-3 flex w-[21.25rem] flex-col border-l border-border-subtlest-tertiary bg-background-default transition-all duration-300 ease-in-out',
                isPostPage ? 'h-[calc(100vh-4rem)]' : 'h-[calc(100vh-8rem)]',
                floatingPhase === FloatingPreviewPhase.Visible
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-full opacity-0',
              )}
            >
              <PostArticlePreviewEmbed {...previewEmbedProps} />
            </div>
          )}
        </div>
      ) : (
        <>
          {postMainColumn}
          {postWidgetsColumn}
          {mobilePreviewDrawer}
        </>
      )}
    </PostContentContainer>
  );
}

export const PostContent = withPostById(PostContentRaw);
