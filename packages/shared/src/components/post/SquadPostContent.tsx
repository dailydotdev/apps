import React, { ReactElement, useEffect } from 'react';
import { useMutation } from 'react-query';
import classNames from 'classnames';
import { PostNavigationProps } from './PostNavigation';
import { postDateFormat } from '../../lib/dateFormat';
import PostContentContainer from './PostContentContainer';
import usePostContent from '../../hooks/usePostContent';
import FixedPostNavigation from './FixedPostNavigation';
import PostSourceInfo from './PostSourceInfo';
import { PostContentProps } from './PostContent';
import { BasePostContent } from './BasePostContent';
import { PostType, sendViewPost } from '../../graphql/posts';
import { useMemberRoleForSource } from '../../hooks/useMemberRoleForSource';
import SquadPostAuthor from './SquadPostAuthor';
import SharePostContent from './SharePostContent';
import WelcomePostContent from './WelcomePostContent';

const ContentMap = {
  [PostType.Welcome]: WelcomePostContent,
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
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost);
  const hasNavigation = !!onPreviousPost || !!onNextPost;

  const engagementActions = usePostContent({ origin, post });
  const { onReadArticle, onSharePost, onToggleBookmark } = engagementActions;
  const { role } = useMemberRoleForSource({
    source: post?.source,
    user: post?.author,
  });

  const navigationProps: PostNavigationProps = {
    post,
    onBookmark: onToggleBookmark,
    onPreviousPost,
    onNextPost,
    onShare: onSharePost,
    postPosition,
    onClose,
    inlineActions,
    onRemovePost,
  };

  useEffect(() => {
    if (!post?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post?.id, onSendViewPost]);

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
          'relative py-8 px-6 post-content',
          className?.container,
        )}
        hasNavigation={hasNavigation}
      >
        <BasePostContent
          className={{
            ...className,
            onboarding: 'mb-6',
            navigation: { actions: 'ml-auto', container: 'mb-6' },
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
            date={postDateFormat(post.createdAt)}
            source={post.source}
            className="!typo-body"
          />
          <SquadPostAuthor author={post.author} role={role} />
          <Content post={post} onReadArticle={onReadArticle} />
        </BasePostContent>
      </PostContentContainer>
    </>
  );
}

export default SquadPostContent;
