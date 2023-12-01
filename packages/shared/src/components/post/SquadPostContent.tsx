import React, { ReactElement, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import classNames from 'classnames';
import { postDateFormat } from '../../lib/dateFormat';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import PostSourceInfo from './PostSourceInfo';
import { BasePostContent } from './BasePostContent';
import { PostType, sendViewPost } from '../../graphql/posts';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import SquadPostAuthor from './SquadPostAuthor';
import SharePostContent from './SharePostContent';
import MarkdownPostContent from './MarkdownPostContent';
import { SquadPostWidgets } from './SquadPostWidgets';
import { isSourcePublicSquad } from '../../graphql/squads';
import { useAuthContext } from '../../contexts/AuthContext';
import { PostContentProps, PostNavigationProps } from './common';

const ContentMap = {
  [PostType.Freeform]: MarkdownPostContent,
  [PostType.Welcome]: MarkdownPostContent,
  [PostType.Share]: SharePostContent,
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

  const Content = ContentMap[post?.type];

  return (
    <>
      {position === 'fixed' && (
        <FixedPostNavigation
          {...navigationProps}
          onReadArticle={onReadArticle}
          className={className?.fixedNavigation}
        />
      )}
      <PostContentContainer
        className={classNames(
          'relative tablet:pb-0 !pb-2',
          className?.container,
          isPublicSquad && 'flex-1 flex-col tablet:flex-row',
        )}
        hasNavigation={hasNavigation}
      >
        <div
          className={classNames(
            'relative px-4 tablet:px-8',
            className?.content,
            isPublicSquad && 'flex flex-col flex-1',
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
            <PostSourceInfo source={post.source} className="!typo-body" />
            <SquadPostAuthor
              author={post.author}
              role={role}
              date={postDateFormat(post.createdAt)}
            />
            <Content post={post} onReadArticle={onReadArticle} />
          </BasePostContent>
        </div>
        {isPublicSquad && (
          <SquadPostWidgets
            onShare={onSharePost}
            onReadArticle={onReadArticle}
            post={post}
            className="px-8 tablet:pl-0 mb-6"
            onClose={onClose}
            origin={origin}
          />
        )}
      </PostContentContainer>
    </>
  );
}

export default SquadPostContent;
