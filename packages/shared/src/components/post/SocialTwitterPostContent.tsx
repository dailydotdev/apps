import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import {
  getSocialTwitterPostType,
  isSocialTwitterShareLike,
  isVideoPost,
  PostType,
} from '../../graphql/posts';
import SharePostContent, { CommonSharePostContent } from './SharePostContent';
import MarkdownPostContent from './MarkdownPostContent';
import { SquadPostWidgets } from './SquadPostWidgets';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PostContentProps, PostNavigationProps } from './common';
import ShareYouTubeContent from './ShareYouTubeContent';
import { useViewPost } from '../../hooks/post';
import { withPostById } from './withPostById';
import PostSourceInfo from './PostSourceInfo';
import { BoostNewPostStrip } from '../../features/boost/BoostNewPostStrip';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';
import PostMetadata from '../cards/common/PostMetadata';
import {
  getSocialTwitterMetadata,
  getSocialTwitterMetadataLabel,
} from '../cards/socialTwitter/socialTwitterHelpers';
import { Separator } from '../cards/common/common';
import { EmbeddedTweetPreview } from '../cards/socialTwitter/EmbeddedTweetPreview';
import { SharePostTitle } from './share/SharePostTitle';
import { PostTagList } from './tags/PostTagList';
import { LazyImage } from '../LazyImage';
import { cloudinaryPostImageCoverPlaceholder } from '../../lib/image';
import { usePostImage } from '../../hooks/post/usePostImage';

const ContentMap = {
  [PostType.Freeform]: MarkdownPostContent,
  [PostType.Welcome]: MarkdownPostContent,
  [PostType.Share]: SharePostContent,
  [PostType.VideoYouTube]: ShareYouTubeContent,
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

  const socialTwitterType = getSocialTwitterPostType(post);
  const finalType = isVideoPost(post)
    ? PostType.VideoYouTube
    : socialTwitterType || post?.type;
  const isShareLike = isSocialTwitterShareLike(post);
  const hasEmbeddedTweet =
    isShareLike && post.sharedPost?.type === PostType.SocialTwitter;
  const shouldShowLinkedPreview =
    finalType !== PostType.Share &&
    !!post.sharedPost &&
    post.sharedPost.type !== PostType.SocialTwitter;
  const Content = ContentMap[finalType] || MarkdownPostContent;

  const {
    repostedByName,
    metadataHandles,
    embeddedTweetIdentity,
    embeddedTweetAvatarUser,
  } = getSocialTwitterMetadata(post);
  const metadataLabel = getSocialTwitterMetadataLabel({
    subType: post.subType,
    repostedByName,
    metadataHandles,
  });

  const postImage = usePostImage(post);
  const showPostImage = !isShareLike && !hasEmbeddedTweet && !!postImage;
  const tagPost = post.tags?.length ? post : post.sharedPost || post;

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
          {hasEmbeddedTweet && (
            <>
              <SharePostTitle title={post.title} titleHtml={post.titleHtml} />
              <EmbeddedTweetPreview
                post={post}
                embeddedTweetAvatarUser={embeddedTweetAvatarUser}
                embeddedTweetIdentity={embeddedTweetIdentity}
                className="mt-4"
                textClampClass=""
              />
            </>
          )}
          {finalType === PostType.Share && !hasEmbeddedTweet && (
            <SharePostContent post={post} onReadArticle={onReadArticle} />
          )}
          {finalType !== PostType.Share && !isShareLike && (
            <>
              <Content post={post} onReadArticle={onReadArticle} />
              {shouldShowLinkedPreview && (
                <CommonSharePostContent
                  onReadArticle={onReadArticle}
                  source={post.source}
                  sharedPost={post.sharedPost}
                />
              )}
            </>
          )}
          <PostTagList post={tagPost} />
          <PostMetadata
            className="mb-8 mt-4 !typo-callout"
            createdAt={post.createdAt}
            readTime={post.readTime}
          >
            {!!post.createdAt && <Separator />}
            {metadataLabel}
          </PostMetadata>
          {showPostImage && (
            <div
              className="mb-10 block cursor-pointer overflow-hidden rounded-16"
              style={{ maxWidth: '25.625rem' }}
            >
              <LazyImage
                imgSrc={postImage}
                imgAlt="Post cover image"
                ratio="49%"
                eager
                fallbackSrc={cloudinaryPostImageCoverPlaceholder}
                fetchPriority="high"
              />
            </div>
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
