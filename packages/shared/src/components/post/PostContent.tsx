import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { feature, featureReaderModal } from '../../lib/featureManagement';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { withPostById } from './withPostById';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { PostTagList } from './tags/PostTagList';
import PostSourceInfo from './PostSourceInfo';
import { PostArticlePreviewEmbed } from './PostArticlePreviewEmbed';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { EarthIcon, MiniCloseIcon } from '../icons';
import { Drawer } from '../drawers/Drawer';
import { useLegacyPostLayoutOptOut } from './reader/hooks/useLegacyPostLayoutOptOut';

type PostContentRawProps = Omit<PostContentProps, 'post'> & { post: Post };

export const SCROLL_OFFSET = 80;

// Post content fixed column (matches grid-cols-[22rem_...] on laptop)
const POST_COLUMN_REM = 22;
// Widgets sidebar width (matches w-[21.25rem] on laptop)
const WIDGETS_COLUMN_REM = 21.25;

const PREVIEW_MIN_WIDTH = 360;
const PREVIEW_RESTORE_WIDTH = 380;
const FLOATING_PREVIEW_ANIMATION_MS = 300;
const REM_IN_PX = 16;
const PREVIEW_LAYOUT_MIN_WIDTH =
  (POST_COLUMN_REM + WIDGETS_COLUMN_REM) * REM_IN_PX + PREVIEW_MIN_WIDTH;

const PostCodeSnippets = dynamic(() =>
  import(/* webpackChunkName: "postCodeSnippets" */ './PostCodeSnippets').then(
    (mod) => mod.PostCodeSnippets,
  ),
);

const ArticleLink = ({
  href,
  onClick,
  children,
  ...props
}: ComponentProps<'a'> & { href?: string; onClick?: () => void }) => {
  const clickHandlers = onClick
    ? combinedClicks<HTMLAnchorElement>(() => onClick())
    : undefined;
  return (
    <a
      href={href}
      title="Go to post"
      target="_blank"
      rel="noopener"
      {...clickHandlers}
      {...props}
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

  const { isOptedOut: isLegacyLayoutOptedOut } = useLegacyPostLayoutOptOut();
  const { value: isReaderModalEnabled } = useConditionalFeature({
    feature: featureReaderModal,
    shouldEvaluate: true,
  });
  const showArticlePreviewEmbed =
    isPreviewHydrated &&
    isReaderModalEnabled &&
    !isLegacyLayoutOptedOut &&
    !isVideoType &&
    post.type === PostType.Article &&
    embedArticleTargetUrl !== null;

  const [isArticlePreviewDismissed, setArticlePreviewDismissed] =
    useState(false);
  const [isArticlePreviewUnavailable, setArticlePreviewUnavailable] =
    useState(false);
  const [isMobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [isPreviewNarrow, setIsPreviewNarrow] = useState(false);
  const [isFloatingPreviewVisible, setFloatingPreviewVisible] = useState(false);
  const [isFloatingPreviewClosing, setFloatingPreviewClosing] = useState(false);
  const [isFloatingPreviewActive, setFloatingPreviewActive] = useState(false);
  const [isTabletPreviewToggling, setTabletPreviewToggling] = useState(false);
  const previewLayoutRef = useRef<HTMLDivElement>(null);
  const previewColumnRef = useRef<HTMLDivElement>(null);
  const ignorePreviewResizeRef = useRef(false);
  const resizeObserverResetTimeoutRef = useRef<
    ReturnType<typeof globalThis.setTimeout> | undefined
  >();
  const floatingPreviewCloseTimeoutRef = useRef<
    ReturnType<typeof globalThis.setTimeout> | undefined
  >();
  const floatingPreviewEnterFrameRef = useRef<number>();

  useEffect(() => {
    setIsPreviewHydrated(true);
  }, []);

  const evaluatePreviewWidth = useCallback((width: number) => {
    setIsPreviewNarrow((prev) => {
      if (!prev && width < PREVIEW_MIN_WIDTH) {
        return true;
      }

      if (prev && width >= PREVIEW_RESTORE_WIDTH) {
        return false;
      }

      return prev;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (!resizeObserverResetTimeoutRef.current) {
        return;
      }

      globalThis.clearTimeout(resizeObserverResetTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!floatingPreviewCloseTimeoutRef.current) {
        return;
      }

      globalThis.clearTimeout(floatingPreviewCloseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!floatingPreviewEnterFrameRef.current) {
        return;
      }

      globalThis.cancelAnimationFrame(floatingPreviewEnterFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (floatingPreviewCloseTimeoutRef.current) {
      globalThis.clearTimeout(floatingPreviewCloseTimeoutRef.current);
      floatingPreviewCloseTimeoutRef.current = undefined;
    }
    if (floatingPreviewEnterFrameRef.current) {
      globalThis.cancelAnimationFrame(floatingPreviewEnterFrameRef.current);
      floatingPreviewEnterFrameRef.current = undefined;
    }
    setArticlePreviewDismissed(false);
    setArticlePreviewUnavailable(false);
    setMobilePreviewOpen(false);
    setIsPreviewNarrow(false);
    setFloatingPreviewVisible(false);
    setFloatingPreviewClosing(false);
    setFloatingPreviewActive(false);
    setTabletPreviewToggling(false);
  }, [post.id]);

  const showArticlePreviewColumn =
    showArticlePreviewEmbed && !isArticlePreviewDismissed;
  const isPreviewFloating =
    isLaptop && showArticlePreviewColumn && isPreviewNarrow;
  const shouldRenderFloatingPreview =
    isFloatingPreviewVisible || isPreviewFloating;
  const isPreviewActive = isTablet
    ? showArticlePreviewColumn
    : isMobilePreviewOpen;

  useEffect(() => {
    if (floatingPreviewCloseTimeoutRef.current) {
      globalThis.clearTimeout(floatingPreviewCloseTimeoutRef.current);
      floatingPreviewCloseTimeoutRef.current = undefined;
    }
    if (floatingPreviewEnterFrameRef.current) {
      globalThis.cancelAnimationFrame(floatingPreviewEnterFrameRef.current);
      floatingPreviewEnterFrameRef.current = undefined;
    }

    if (isPreviewFloating) {
      setFloatingPreviewVisible(true);
      setFloatingPreviewClosing(false);
      setFloatingPreviewActive(false);
      floatingPreviewEnterFrameRef.current = globalThis.requestAnimationFrame(
        () => {
          setFloatingPreviewActive(true);
        },
      );
      return;
    }

    if (!isFloatingPreviewVisible) {
      return;
    }

    setFloatingPreviewActive(false);
    setFloatingPreviewClosing(true);
    floatingPreviewCloseTimeoutRef.current = globalThis.setTimeout(() => {
      setFloatingPreviewVisible(false);
      setFloatingPreviewClosing(false);
      setFloatingPreviewActive(false);
    }, FLOATING_PREVIEW_ANIMATION_MS);
  }, [isFloatingPreviewVisible, isPreviewFloating]);

  useEffect(() => {
    const node = previewColumnRef.current;

    if (!isLaptop || !showArticlePreviewColumn || !node) {
      setIsPreviewNarrow(false);
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (ignorePreviewResizeRef.current) {
        return;
      }

      const { width } = entry.contentRect;

      if (width < 1) {
        return;
      }

      evaluatePreviewWidth(width);
    });

    observer.observe(node);
    if (!ignorePreviewResizeRef.current) {
      evaluatePreviewWidth(node.getBoundingClientRect().width);
    }

    return () => observer.disconnect();
  }, [evaluatePreviewWidth, isLaptop, showArticlePreviewColumn]);

  const onToggleArticlePreview = useCallback(() => {
    if (isTablet) {
      const isOpeningPreview = isArticlePreviewDismissed;
      let shouldForceFloatingOnOpen = false;
      if (isOpeningPreview && isLaptop) {
        const layoutWidth =
          previewLayoutRef.current?.getBoundingClientRect().width;
        if (layoutWidth && layoutWidth < PREVIEW_LAYOUT_MIN_WIDTH) {
          setIsPreviewNarrow(true);
          shouldForceFloatingOnOpen = true;
        }
      }

      if (isOpeningPreview) {
        if (floatingPreviewCloseTimeoutRef.current) {
          globalThis.clearTimeout(floatingPreviewCloseTimeoutRef.current);
          floatingPreviewCloseTimeoutRef.current = undefined;
        }
        if (floatingPreviewEnterFrameRef.current) {
          globalThis.cancelAnimationFrame(floatingPreviewEnterFrameRef.current);
          floatingPreviewEnterFrameRef.current = undefined;
        }
        setFloatingPreviewVisible(false);
        setFloatingPreviewClosing(false);
        setFloatingPreviewActive(false);
      }
      ignorePreviewResizeRef.current = true;
      if (resizeObserverResetTimeoutRef.current) {
        globalThis.clearTimeout(resizeObserverResetTimeoutRef.current);
      }
      resizeObserverResetTimeoutRef.current = globalThis.setTimeout(() => {
        ignorePreviewResizeRef.current = false;
        setTabletPreviewToggling(false);
        const width = previewColumnRef.current?.getBoundingClientRect().width;
        if (!width || width < 1) {
          setIsPreviewNarrow(false);
          return;
        }
        evaluatePreviewWidth(width);
      }, 350);
      setArticlePreviewDismissed((currentState) => !currentState);
      if (!shouldForceFloatingOnOpen) {
        setIsPreviewNarrow(false);
      }
      setTabletPreviewToggling(true);
    } else {
      setMobilePreviewOpen((currentState) => !currentState);
    }
  }, [evaluatePreviewWidth, isArticlePreviewDismissed, isLaptop, isTablet]);

  const onPreviewUnavailable = useCallback(() => {
    setArticlePreviewUnavailable(true);
    setArticlePreviewDismissed(true);
    setMobilePreviewOpen(false);
  }, []);

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
      className={classNames(
        'relative',
        className?.content,
        showArticlePreviewColumn &&
          'laptop:overflow-y-auto laptop:overscroll-y-contain',
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
          <div
            className={classNames(
              'mb-6 overflow-hidden text-text-secondary',
              isCompactModalSpacing && 'mb-4',
            )}
          >
            <p
              className="select-text break-words typo-markdown"
              data-testid="tldr-container"
            >
              {post.summary}
            </p>
          </div>
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

  const getPreviewGridColsClass = (): string => {
    if (!showArticlePreviewColumn || !isTablet) {
      return 'grid-cols-[1fr_0px_0fr]';
    }

    if (!isLaptop) {
      return 'grid-cols-[1fr_0px_1fr]';
    }

    if (isPreviewFloating) {
      return 'grid-cols-[1fr_0px_0fr]';
    }

    return 'grid-cols-[22rem_0px_1fr]';
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
        <div
          ref={previewLayoutRef}
          className="relative flex min-h-0 w-full flex-1"
        >
          <div
            className={classNames(
              'grid min-h-0 min-w-0 flex-1 transition-[grid-template-columns] duration-300 ease-in-out',
              getPreviewGridColsClass(),
            )}
          >
            <div className="flex min-w-0 flex-col overflow-hidden">
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
                showArticlePreviewColumn &&
                  !isPreviewFloating &&
                  !isTabletPreviewToggling
                  ? 'opacity-100 delay-100'
                  : 'opacity-0',
              )}
            >
              {!isPreviewFloating && !isTabletPreviewToggling && (
                <PostArticlePreviewEmbed
                  targetUrl={embedArticleTargetUrl}
                  previewHost={post.domain ?? undefined}
                  onPreviewUnavailable={onPreviewUnavailable}
                  forceUnavailable={isArticlePreviewUnavailable}
                />
              )}
            </div>
          </div>
          {isLaptop && postWidgetsColumn}
          {shouldRenderFloatingPreview && (
            <div
              className={classNames(
                'absolute right-0 top-0 z-3 flex h-full w-[21.25rem] flex-col border-l border-border-subtlest-tertiary bg-background-default transition-all duration-300 ease-in-out',
                isFloatingPreviewActive && !isFloatingPreviewClosing
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-full opacity-0',
              )}
            >
              <PostArticlePreviewEmbed
                targetUrl={embedArticleTargetUrl}
                previewHost={post.domain ?? undefined}
                onPreviewUnavailable={onPreviewUnavailable}
                forceUnavailable={isArticlePreviewUnavailable}
              />
            </div>
          )}
          <Drawer
            isOpen={!isTablet && isMobilePreviewOpen}
            onClose={() => setMobilePreviewOpen(false)}
            className={{
              wrapper: 'h-[88vh]',
              drawer: 'flex-1 !p-0',
            }}
            displayCloseButton
            appendOnRoot
          >
            <PostArticlePreviewEmbed
              targetUrl={embedArticleTargetUrl}
              previewHost={post.domain ?? undefined}
              onPreviewUnavailable={onPreviewUnavailable}
              forceUnavailable={isArticlePreviewUnavailable}
              className="!flex"
            />
          </Drawer>
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
