import classNames from 'classnames';
import type { ComponentProps, ReactElement } from 'react';
import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { Post } from '../../graphql/posts';
import { isVideoPost } from '../../graphql/posts';
import PostMetadata from '../cards/common/PostMetadata';
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
import { withPostById } from './withPostById';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import { useReaderInstallPromptGate } from '../../hooks/useReaderInstallPromptGate';
import { PostExperienceLayout } from './experience/PostExperienceLayout';
import { PostHero } from './experience/PostHero';
import { PostInsightPanel } from './experience/PostInsightPanel';
import { PostContextRail } from './experience/PostContextRail';
import { PersonalizedFeedPreview } from './experience/PersonalizedFeedPreview';

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
  const handleImageClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (onReaderInstallGateClick(event)) {
      return;
    }
    onReadArticle();
  };
  const onSendViewPost = useViewPost();
  const showCodeSnippets = useFeature(feature.showCodeSnippets);
  const { title } = useSmartTitle(post);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const isVideoType = isVideoPost(post);
  const isCompactModalSpacing = !isPostPage;
  const containerClass = classNames(
    'px-2 py-3 tablet:px-4 laptop:flex-row laptop:pb-6',
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
        'relative overflow-visible !px-0 laptop:!border-r-0',
        className?.content,
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
        <PostExperienceLayout
          hero={
            <PostHero
              hideSubscribeAction={hideSubscribeAction}
              inlineActions={inlineActions}
              isVideoType={isVideoType}
              metadata={
                <PostMetadata
                  className="!typo-callout"
                  createdAt={post.createdAt}
                  domain={
                    !isVideoType &&
                    post.domain &&
                    post.domain.length > 0 && (
                      <TruncateText>
                        From{' '}
                        <ArticleLink
                          className="hover:underline"
                          href={post.permalink}
                          onClick={onReadArticle}
                          title={post.domain}
                        >
                          {post.domain}
                        </ArticleLink>
                      </TruncateText>
                    )
                  }
                  isVideoType={isVideoType}
                  readTime={post.readTime}
                />
              }
              onClose={onClose}
              onImageClick={handleImageClick}
              onReadArticle={onReadArticle}
              post={post}
              title={title}
            />
          }
          rail={
            <PostContextRail
              onCopyPostLink={onCopyPostLink}
              origin={origin}
              post={post}
            />
          }
        >
          {isVideoType && (
            <YoutubeVideo
              className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-surface-float p-3"
              placeholderProps={{ post, onWatchVideo: onReadArticle }}
              videoId={post.videoId ?? ''}
            />
          )}
          <PostInsightPanel post={post}>
            {showCodeSnippets && (
              <PostCodeSnippets
                className={isCompactModalSpacing ? 'mb-4' : 'mb-6'}
                post={post}
              />
            )}
          </PostInsightPanel>
          <PersonalizedFeedPreview post={post} />
        </PostExperienceLayout>
      </BasePostContent>
    </PostContainer>
  );

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
      {postMainColumn}
    </PostContentContainer>
  );
}

export const PostContent = withPostById(PostContentRaw);
