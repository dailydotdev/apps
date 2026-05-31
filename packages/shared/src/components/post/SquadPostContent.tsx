import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import {
  getSocialTwitterPostType,
  isVideoPost,
  PostType,
} from '../../graphql/posts';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import SquadPostAuthor from './SquadPostAuthor';
import SharePostContent from './SharePostContent';
import MarkdownPostContent from './MarkdownPostContent';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PostContentProps, PostNavigationProps } from './common';
import ShareYouTubeContent from './ShareYouTubeContent';
import { useViewPost } from '../../hooks/post';
import { withPostById } from './withPostById';
import { isSourceUserSource } from '../../graphql/sources';
import { ProfileImageSize } from '../ProfilePicture';
import { BoostNewPostStrip } from '../../features/boost/BoostNewPostStrip';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { useShowBoostButton } from '../../features/boost/useShowBoostButton';
import type { Post } from '../../graphql/posts';
import { PostExperienceLayout } from './experience/PostExperienceLayout';
import { PostHero } from './experience/PostHero';
import { PostContextRail } from './experience/PostContextRail';
import { PersonalizedFeedPreview } from './experience/PersonalizedFeedPreview';

const ContentMap = {
  [PostType.Freeform]: MarkdownPostContent,
  [PostType.Welcome]: MarkdownPostContent,
  [PostType.Share]: SharePostContent,
  [PostType.VideoYouTube]: ShareYouTubeContent,
};

const getSquadContentComponent = (type: PostType) => {
  if (type === PostType.Freeform || type === PostType.Welcome) {
    return ContentMap[PostType.Freeform];
  }

  if (type === PostType.VideoYouTube) {
    return ContentMap[PostType.VideoYouTube];
  }

  return ContentMap[PostType.Share];
};

type SquadPostContentRawProps = Omit<PostContentProps, 'post'> & { post: Post };

function SquadPostContentRaw({
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
}: SquadPostContentRawProps): ReactElement {
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
  const isCompactModalSpacing = !isPostPage;
  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onCopyPostLink } = engagementActions;
  const { role } = useMemberRoleForSource({
    source: post?.source,
    user: post?.author,
  });
  const navigationProps: PostNavigationProps = {
    post,
    onPreviousPost,
    onNextPost,
    postPosition,
    onClose,
    inlineActions,
  };
  const isUserSource = isSourceUserSource(post?.source);
  const heroTitle = post.title || post.sharedPost?.title || 'Post';

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
  const Content = getSquadContentComponent(finalType);

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
              isBannerVisible,
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
          engagementProps={engagementActions}
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
                title={heroTitle}
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
            {shouldShowBanner && !isLaptop && (
              <BoostNewPostStrip className="-mt-2" />
            )}
            <section className="shadow-1 rounded-24 border border-border-subtlest-tertiary bg-background-subtle p-4 tablet:p-6">
              <div
                className={classNames(
                  'mb-5 flex flex-col gap-3',
                  isUserSource && 'tablet:flex-row-reverse tablet:items-center',
                )}
              >
                {shouldShowBanner && isLaptop && <BoostNewPostStrip />}
                {(post?.author || isFallback) && (
                  <SquadPostAuthor
                    author={post?.author}
                    className={{
                      container: isUserSource ? 'shrink truncate' : undefined,
                    }}
                    date={post.createdAt}
                    isUserSource={isUserSource}
                    role={role}
                    showSkeletonWhenMissing={isFallback}
                    size={ProfileImageSize.Large}
                  />
                )}
              </div>
              <Content
                isCompactSpacing={isCompactModalSpacing}
                onReadArticle={onReadArticle}
                post={post}
              />
            </section>
            <PersonalizedFeedPreview post={post} />
          </PostExperienceLayout>
        </BasePostContent>
      </div>
    </PostContentContainer>
  );
}

export const SquadPostContent = withPostById(SquadPostContentRaw);
