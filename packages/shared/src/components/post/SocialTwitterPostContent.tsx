import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import type { Post } from '../../graphql/posts';
import {
  isSocialTwitterPost,
  isSocialTwitterShareLike,
} from '../../graphql/posts';
import { SquadPostWidgets } from './SquadPostWidgets';
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
  getSocialTwitterMetadata,
  parseSocialTwitterTitle,
  getSocialTextDirectionProps,
  getSocialTwitterMetadataLabel,
} from '../cards/socialTwitter/socialTwitterHelpers';
import { Separator } from '../cards/common/common';

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
    readButtonText: 'Read on X',
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
  const isQuoteLike = isSocialTwitterShareLike(post);
  const isThread = post.subType === 'thread';
  const shouldRenderPrimaryTweetPreview =
    isSocialTwitterPost(post) && !isQuoteLike && !isThread;
  const shouldHideRepostHeadlineAndTags =
    post.subType === 'repost' &&
    !post.contentHtml?.trim() &&
    !post.content?.trim();
  const { embeddedTweetIdentity, embeddedTweetAvatarUser } =
    getSocialTwitterMetadata(post);
  const metadataLabel = getSocialTwitterMetadataLabel();
  const xTitleMatch = parseSocialTwitterTitle(post.title);
  const primaryTweetBody = xTitleMatch?.[3]?.trim() || post.title;
  const primaryTweetPost = shouldRenderPrimaryTweetPreview
    ? ({
        ...post,
        sharedPost: {
          ...post,
          title: primaryTweetBody,
          image: post.image,
          source: post.source,
        },
      } as Post)
    : post;
  const primaryTweetIdentity = xTitleMatch
    ? `${xTitleMatch[1].trim()} @${xTitleMatch[2].trim()}`
    : embeddedTweetIdentity;
  const socialTextDirectionProps = getSocialTextDirectionProps(post.language);

  return (
    <PostContentContainer
      className={classNames(
        'relative flex-1 flex-col laptop:flex-row laptop:pb-0',
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
          'relative flex min-w-0 flex-1 flex-col px-4 tablet:px-6 laptop:px-8 laptop:pt-6',
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
          engagementProps={engagementActions}
          origin={origin}
          post={post}
        >
          {shouldShowBanner && !isLaptop && (
            <BoostNewPostStrip className="-mt-2 mb-4" />
          )}
          <PostSourceInfo
            post={post}
            onClose={onClose}
            onReadArticle={onReadArticle}
            readButtonText="Read on X"
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
            <Markdown content={post.contentHtml} className="mb-5 break-words" />
          )}
          {shouldRenderPrimaryTweetPreview && (
            <EmbeddedTweetPreview
              post={primaryTweetPost}
              embeddedTweetAvatarUser={embeddedTweetAvatarUser}
              embeddedTweetIdentity={primaryTweetIdentity}
              className="mb-5 w-full"
              textClampClass=""
              bodyClassName="typo-markdown"
              mediaContainerClassName="max-w-[25.625rem]"
              mediaClassName="aspect-[100/49] h-full"
              showXLogo
              showMedia
            />
          )}
          {isQuoteLike && !!post.sharedPost && (
            <EmbeddedTweetPreview
              post={post}
              embeddedTweetAvatarUser={embeddedTweetAvatarUser}
              embeddedTweetIdentity={embeddedTweetIdentity}
              className="mb-5 w-full"
              textClampClass=""
              bodyClassName="typo-markdown"
              mediaContainerClassName="max-w-[25.625rem]"
              mediaClassName="aspect-[100/49] h-full"
              showXLogo
            />
          )}
        </BasePostContent>
      </div>
      <SquadPostWidgets
        onCopyPostLink={onCopyPostLink}
        onReadArticle={onReadArticle}
        post={post}
        className="mb-6 !gap-2 border-l border-border-subtlest-tertiary pt-4 laptop:mb-0"
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
}

export const SocialTwitterPostContent = withPostById(
  SocialTwitterPostContentRaw,
);
