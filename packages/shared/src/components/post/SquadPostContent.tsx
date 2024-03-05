import React, { ReactElement, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { postDateFormat } from '../../lib/dateFormat';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import PostSourceInfo from './PostSourceInfo';
import { BasePostContent } from './BasePostContent';
import { PostType, isVideoPost, sendViewPost } from '../../graphql/posts';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import SquadPostAuthor from './SquadPostAuthor';
import SharePostContent from './SharePostContent';
import MarkdownPostContent from './MarkdownPostContent';
import { SquadPostWidgets } from './SquadPostWidgets';
import { isSourcePublicSquad } from '../../graphql/squads';
import { useAuthContext } from '../../contexts/AuthContext';
import { PostContentProps, PostNavigationProps } from './common';
import ShareYouTubeContent from './ShareYouTubeContent';

const ContentMap = {
  [PostType.Freeform]: MarkdownPostContent,
  [PostType.Welcome]: MarkdownPostContent,
  [PostType.Share]: SharePostContent,
  [PostType.VideoYouTube]: ShareYouTubeContent,
};

function SquadPostContent({
  post,
  isFallback,
  shouldOnboardAuthor,
  enableShowShareNewComment,
  origin,
  position,
  postPosition,
  inlineActions,
  className,
  customNavigation,
  onPreviousPost,
  onNextPost,
  onClose,
  onRemovePost,
  isBannerVisible,
}: PostContentProps): ReactElement {
  const { user } = useAuthContext();
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost);
  const hasNavigation = !!onPreviousPost || !!onNextPost;
  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onSharePost } = engagementActions;
  const { role } = useMemberRoleForSource({
    source: post?.source,
    user: post?.author,
  });
  const isPublicSquad = isSourcePublicSquad(post?.source);

  const navigationProps: PostNavigationProps = {
    post,
    onPreviousPost,
    onNextPost,
    onShare: onSharePost,
    postPosition,
    onClose,
    inlineActions,
    onRemovePost,
  };

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post.id, onSendViewPost, user?.id]);

  const finalType = isVideoPost(post) ? PostType.VideoYouTube : post?.type;
  const Content = ContentMap[finalType];

  return (
    <>
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          isBannerVisible={isBannerVisible}
          onReadArticle={onReadArticle}
          className={className?.fixedNavigation}
        />
      )}
      <PostContentContainer
        className={classNames(
          'relative tablet:pb-0',
          className?.container,
          isPublicSquad ? 'flex-1 flex-col tablet:flex-row' : '!pb-2',
        )}
        hasNavigation={hasNavigation}
      >
        <div
          className={classNames(
            'relative min-w-0 px-4 tablet:px-8',
            className?.content,
            isPublicSquad && 'flex flex-1 flex-col',
          )}
        >
          <BasePostContent
            className={{
              ...className,
              onboarding: classNames('mb-6', className?.onboarding),
              navigation: {
                actions: classNames(
                  'ml-auto',
                  isPublicSquad && 'tablet:hidden',
                ),
                container: classNames('mb-6 pt-6'),
              },
            }}
            isFallback={isFallback}
            customNavigation={customNavigation}
            enableShowShareNewComment={enableShowShareNewComment}
            shouldOnboardAuthor={shouldOnboardAuthor}
            navigationProps={navigationProps}
            engagementProps={engagementActions}
            origin={origin}
            post={post}
          >
            <PostSourceInfo
              source={post.source}
              className={classNames('!typo-body', customNavigation && 'mt-6')}
            />
            {post.author && (
              <SquadPostAuthor
                author={post.author}
                role={role}
                date={postDateFormat(post.createdAt)}
                className={{ container: 'mt-3' }}
              />
            )}
            <Content post={post} onReadArticle={onReadArticle} />
          </BasePostContent>
        </div>
        {isPublicSquad && (
          <SquadPostWidgets
            onShare={onSharePost}
            onReadArticle={onReadArticle}
            post={post}
            className="mb-6 border-l border-theme-divider-tertiary px-8 tablet:mb-0 tablet:pl-4"
            onClose={onClose}
            origin={origin}
          />
        )}
      </PostContentContainer>
    </>
  );
}

export default SquadPostContent;
