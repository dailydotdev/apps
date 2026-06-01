import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import type { Post } from '../../graphql/posts';
import { isSocialTwitterPost } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PostContentProps, PostNavigationProps } from './common';
import { useViewPost } from '../../hooks/post';
import { withPostById } from './withPostById';
import PostSourceInfo from './PostSourceInfo';
import { BoostNewPostStrip } from '../../features/boost/BoostNewPostStrip';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';
import { useSmartTitle } from '../../hooks/post/useSmartTitle';
import PostMetadata from '../cards/common/PostMetadata';
import { LazyImage } from '../LazyImage';
import {
  cloudinaryPostImageCoverPlaceholder,
  isPlaceholderImage,
} from '../../lib/image';
import Markdown from '../Markdown';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { EmbeddedTweetPreview } from '../cards/socialTwitter/EmbeddedTweetPreview';
import {
  getSocialTextDirectionProps,
  getSocialTwitterMetadataLabel,
} from '../cards/socialTwitter/socialTwitterHelpers';
import { Separator } from '../cards/common/common';
import { PostExperienceLayout } from './experience/PostExperienceLayout';
import { PostHero } from './experience/PostHero';
import { PostContextRail } from './experience/PostContextRail';
import { PersonalizedFeedPreview } from './experience/PersonalizedFeedPreview';
import { PostCommunitySection } from './experience/PostCommunitySection';

type SocialTwitterPostContentRawProps = Omit<PostContentProps, 'post'> & {
  post: Post;
};

function SocialTwitterPostContentRaw({
  post,
  isFallback,
  shouldOnboardAuthor,
  origin,
  position,
  postPosition,
  inlineActions,
  hideSubscribeAction,
  className,
  customNavigation,
  onPreviousPost,
  onNextPost,
  onClose,
  isBannerVisible,
  isPostPage,
}: SocialTwitterPostContentRawProps): ReactElement {
  const isBoostButtonVisible = useShowBoostButton({ post });
  const { user } = useAuthContext();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const hasClosedBanner = checkHasCompleted(
    ActionType.ClosedNewPostBoostBanner,
  );
  const shouldShowBanner =
    isActionsFetched &&
    !hasClosedBanner &&
    isPostPage &&
    isBoostButtonVisible &&
    !post.flags?.campaignId;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const onSendViewPost = useViewPost();
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const isCompactModalSpacing = !isPostPage;
  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onCopyPostLink } = engagementActions;
  const navigationProps: PostNavigationProps = {
    post,
    onPreviousPost,
    onNextPost,
    postPosition,
    onClose,
    inlineActions,
  };
  let sourceInfoClassName = 'mb-6';
  if (shouldShowBanner && isLaptop) {
    sourceInfoClassName = isCompactModalSpacing ? 'mb-3' : 'mb-4';
  } else if (isCompactModalSpacing) {
    sourceInfoClassName = 'mb-4';
  }

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post.id, onSendViewPost, user?.id]);

  const { title } = useSmartTitle(post);
  const isThread = post.subType === 'thread';
  const shouldRenderPrimaryTweetPreview =
    isSocialTwitterPost(post) && !isThread;
  const shouldHideRepostHeadlineAndTags =
    post.subType === 'repost' &&
    !post.contentHtml?.trim() &&
    !post.content?.trim();
  const metadataLabel = getSocialTwitterMetadataLabel();
  const socialTextDirectionProps = getSocialTextDirectionProps(post.language);

  return (
    <PostContentContainer
      className={classNames(
        'relative flex-1 flex-col px-2 py-3 tablet:px-4 laptop:pb-6',
        className?.container,
      )}
      hasNavigation={hasNavigation}
      isNavigationOutside
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible: !!isBannerVisible,
              onReadArticle,
              className: className?.fixedNavigation,
            }
          : undefined
      }
    >
      <div
        className={classNames(
          'relative flex min-w-0 flex-1 flex-col',
          className?.content,
        )}
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: classNames('mb-6', className?.onboarding),
            header: 'mb-6',
            navigation: {
              actions: 'ml-auto laptop:hidden',
              container: 'mb-6 pt-6',
            },
          }}
          isPostPage={isPostPage}
          isFallback={isFallback}
          customNavigation={customNavigation}
          shouldOnboardAuthor={shouldOnboardAuthor}
          navigationProps={navigationProps}
          origin={origin}
          post={post}
        >
          <PostExperienceLayout
            hero={
              <PostHero
                hideSubscribeAction={hideSubscribeAction}
                inlineActions={inlineActions}
                onClose={onClose}
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
            <section className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6">
              {shouldShowBanner && !isLaptop && (
                <BoostNewPostStrip className="-mt-2 mb-4" />
              )}
              <PostSourceInfo
                post={post}
                onClose={onClose}
                onReadArticle={onReadArticle}
                hideSubscribeAction={hideSubscribeAction}
                className={sourceInfoClassName}
              />
              {shouldShowBanner && isLaptop && <BoostNewPostStrip />}
              <PostMetadata
                createdAt={post.createdAt}
                readTime={post.readTime}
                className={classNames('mt-4 !typo-callout', 'mb-4')}
              >
                {!!post.createdAt && <Separator className="mx-0" />}
                {metadataLabel}
              </PostMetadata>
              {!shouldHideRepostHeadlineAndTags &&
                !shouldRenderPrimaryTweetPreview && (
                  <div className="mb-6 mt-0">
                    {post.titleHtml ? (
                      <h1
                        {...socialTextDirectionProps}
                        className="whitespace-pre-line break-words text-text-primary typo-markdown"
                        data-testid="post-modal-title"
                        dangerouslySetInnerHTML={{ __html: post.titleHtml }}
                      />
                    ) : (
                      <h1
                        {...socialTextDirectionProps}
                        className="whitespace-pre-line break-words text-text-primary typo-markdown"
                        data-testid="post-modal-title"
                      >
                        {title}
                      </h1>
                    )}
                    {post.clickbaitTitleDetected && (
                      <PostClickbaitShield post={post} />
                    )}
                  </div>
                )}
              {!shouldHideRepostHeadlineAndTags &&
                !shouldRenderPrimaryTweetPreview &&
                !!post.image &&
                !isPlaceholderImage(post.image) &&
                !!post.permalink && (
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noopener"
                    className="mb-10 block cursor-pointer overflow-hidden rounded-16"
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
                  </a>
                )}
              {isThread && !!post.contentHtml && (
                <Markdown
                  content={post.contentHtml}
                  className="mb-5 break-words"
                />
              )}
              {shouldRenderPrimaryTweetPreview && (
                <EmbeddedTweetPreview
                  post={post}
                  className="mb-5 w-full"
                  textClampClass=""
                  bodyClassName="typo-markdown"
                  showImage
                />
              )}
            </section>
            <PostCommunitySection
              onCopyPostLink={onCopyPostLink}
              origin={origin}
              post={post}
              shouldOnboardAuthor={shouldOnboardAuthor}
            />
            <PersonalizedFeedPreview post={post} />
          </PostExperienceLayout>
        </BasePostContent>
      </div>
    </PostContentContainer>
  );
}

export const SocialTwitterPostContent = withPostById(
  SocialTwitterPostContentRaw,
);
