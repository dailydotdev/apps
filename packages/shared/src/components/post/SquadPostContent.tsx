import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import { BasePostContent } from './BasePostContent';
import { isVideoPost, PostType } from '../../graphql/posts';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import SquadPostAuthor from './SquadPostAuthor';
import SharePostContent from './SharePostContent';
import MarkdownPostContent from './MarkdownPostContent';
import { SquadPostWidgets } from './SquadPostWidgets';
import { useAuthContext } from '../../contexts/AuthContext';
import type { PostContentProps, PostNavigationProps } from './common';
import ShareYouTubeContent from './ShareYouTubeContent';
import { useViewPost } from '../../hooks/post';
import { withPostById } from './withPostById';
import PostSourceInfo from './PostSourceInfo';
import { isSourceUserSource } from '../../graphql/sources';
import { ProfileImageSize } from '../ProfilePicture';

const ContentMap = {
  [PostType.Freeform]: MarkdownPostContent,
  [PostType.Welcome]: MarkdownPostContent,
  [PostType.Share]: SharePostContent,
  [PostType.VideoYouTube]: ShareYouTubeContent,
};

function SquadPostContentRaw({
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
  const { user } = useAuthContext();
  const onSendViewPost = useViewPost();
  const hasNavigation = !!onPreviousPost || !!onNextPost;
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

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post.id, onSendViewPost, user?.id]);

  const finalType = isVideoPost(post) ? PostType.VideoYouTube : post?.type;
  const Content = ContentMap[finalType];

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
              isBannerVisible,
              onReadArticle,
              className: className?.fixedNavigation,
            }
          : null
      }
    >
      <div
        className={classNames(
          'relative flex min-w-0 flex-1 flex-col px-4 laptop:px-8 laptop:pt-6',
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
          <div
            className={
              isUserSource
                ? 'flex flex-row-reverse items-center justify-between truncate'
                : undefined
            }
          >
            <PostSourceInfo
              post={post}
              onClose={onClose}
              onReadArticle={onReadArticle}
              className="mb-6"
            />
            <SquadPostAuthor
              author={post?.author}
              role={role}
              date={post.createdAt}
              className={{
                container: !isUserSource ? 'mt-3' : 'shrink truncate',
              }}
              isUserSource={isUserSource}
              size={ProfileImageSize.Large}
            />
          </div>
          <Content post={post} onReadArticle={onReadArticle} />
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

export const SquadPostContent = withPostById(SquadPostContentRaw);
