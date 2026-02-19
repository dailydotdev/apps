import type { ReactElement } from 'react';
import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import { isSocialTwitterShareLike } from '../../graphql/posts';
import type { Post } from '../../graphql/posts';
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
import { PostTagList } from './tags/PostTagList';
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import Markdown from '../Markdown';
import { PostClickbaitShield } from './common/PostClickbaitShield';
import { EmbeddedTweetPreview } from '../cards/socialTwitter/EmbeddedTweetPreview';
import { getSocialTwitterMetadata } from '../cards/socialTwitter/socialTwitterHelpers';

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
}: PostContentProps): ReactElement {
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
    !post?.flags?.campaignId;
  const isLaptop = useViewSize(ViewSize.Laptop);
  const onSendViewPost = useViewPost();
  const hasNavigation = !!onPreviousPost || !!onNextPost;
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

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post.id, onSendViewPost, user?.id]);

  const { title } = useSmartTitle(post);
  const isQuoteLike = isSocialTwitterShareLike(post);
  const isThread = post.subType === 'thread';
  const shouldHideRepostHeadlineAndTags =
    post.subType === 'repost' && !post.content?.trim();
  const { embeddedTweetIdentity, embeddedTweetAvatarUser } =
    getSocialTwitterMetadata(post);

  const postForTags = useMemo(() => {
    if (post.tags?.length) {
      return post;
    }

    if (post.sharedPost?.tags?.length) {
      return { ...post, tags: post.sharedPost.tags } as Post;
    }

    return post;
  }, [post]);

  return (
    <PostContentContainer
      className={classNames(
        'relative flex-1 flex-col overflow-x-hidden laptop:flex-row laptop:pb-0',
        className?.container,
      )}
      hasNavigation={hasNavigation}
      isNavigationOutside
      navigationProps={
        position === 'fixed'
          ? {
              ...navigationProps,
              isBannerVisible,
              onReadArticle,
              className: className?.fixedNavigation,
            }
          : null
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
            className={shouldShowBanner && isLaptop ? 'mb-4' : 'mb-6'}
          />
          {shouldShowBanner && isLaptop && <BoostNewPostStrip />}
          {!shouldHideRepostHeadlineAndTags && (
            <div className="my-6">
              <h1
                className="whitespace-pre-line break-words font-bold typo-large-title"
                data-testid="post-modal-title"
              >
                {title}
              </h1>
              {post.clickbaitTitleDetected && (
                <PostClickbaitShield post={post} />
              )}
            </div>
          )}
          {!shouldHideRepostHeadlineAndTags && (
            <PostTagList post={postForTags} />
          )}
          <PostMetadata
            createdAt={post.createdAt}
            readTime={post.readTime}
            className={classNames('mt-4 !typo-callout', 'mb-8')}
          />
          {!shouldHideRepostHeadlineAndTags && !!post.image && (
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
          {isQuoteLike && !!post.sharedPost && (
            <EmbeddedTweetPreview
              post={post}
              embeddedTweetAvatarUser={embeddedTweetAvatarUser}
              embeddedTweetIdentity={embeddedTweetIdentity}
              className="mb-5 w-full"
              textClampClass=""
            />
          )}
        </BasePostContent>
      </div>
      <SquadPostWidgets
        onCopyPostLink={onCopyPostLink}
        onReadArticle={onReadArticle}
        post={post}
        className="mb-6 border-l border-border-subtlest-tertiary pt-4 laptop:mb-0"
        onClose={onClose}
        origin={origin}
      />
    </PostContentContainer>
  );
}

export const SocialTwitterPostContent = withPostById(
  SocialTwitterPostContentRaw,
);
