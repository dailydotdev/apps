import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Post } from '../../graphql/posts';
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
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { withPostById } from './withPostById';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { PostTagList } from './tags/PostTagList';
import PostSourceInfo from './PostSourceInfo';
import { useReaderInstallPromptGate } from '../../hooks/useReaderInstallPromptGate';
import { useAnonPostOnboarding } from '../../features/postPageOnboarding/useAnonPostOnboarding';
import { useAnonConversionPrompt } from '../../features/postPageOnboarding/useAnonConversionPrompt';
import { AnonConversionPrompt } from '../../features/postPageOnboarding/AnonConversionPrompt';

type PostContentRawProps = Omit<PostContentProps, 'post'> & { post: Post };

export const SCROLL_OFFSET = 80;

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
}: ComponentProps<'a'> & {
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) => {
  const clickHandlers = onClick
    ? combinedClicks<HTMLAnchorElement>(onClick)
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
  const { onReadClick: onReaderInstallGateClick } = useReaderInstallPromptGate(
    post,
    {
      onCloseParent: onClose
        ? () => (onClose as (event?: unknown) => void)()
        : undefined,
    },
  );
  // Anonymous "build your feed" experience — only on the full post page.
  const { isEnabled: isAnonExperience } = useAnonPostOnboarding();
  const anonExperienceActive = isAnonExperience && !!isPostPage;
  const {
    isOpen: isConversionOpen,
    reason: conversionReason,
    openPrompt,
    closePrompt,
  } = useAnonConversionPrompt({ enabled: anonExperienceActive });

  // Turn the bounce into the conversion: the click to read the original
  // article is peak intent. Intercept it once for anonymous readers to offer
  // a personalized feed instead of silently sending them off-site.
  const interceptAnonRead = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ): boolean => {
    if (!anonExperienceActive) {
      return false;
    }
    if (openPrompt('read_intent')) {
      event.preventDefault();
      return true;
    }
    return false;
  };

  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (interceptAnonRead(event)) {
      return;
    }
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };
  const handleTitleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (interceptAnonRead(event)) {
      return;
    }
    onReadArticle();
  };
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
          </div>
          <h1
            className="break-words font-bold typo-large-title"
            data-testid="post-modal-title"
          >
            <ArticleLink href={post.permalink} onClick={handleTitleClick}>
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
            onClick={handleImageClick}
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
      className="!gap-2 pb-8 pt-4 tablet:border-l tablet:border-border-subtlest-tertiary"
      onClose={onClose}
      origin={origin}
      onCopyPostLink={onCopyPostLink}
    />
  );

  return (
    <>
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
        {postMainColumn}
        {postWidgetsColumn}
      </PostContentContainer>
      {anonExperienceActive && isConversionOpen && (
        <AnonConversionPrompt
          post={post}
          reason={conversionReason}
          onClose={closePrompt}
        />
      )}
    </>
  );
}

export const PostContent = withPostById(PostContentRaw);
