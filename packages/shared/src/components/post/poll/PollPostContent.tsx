import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import classNames from 'classnames';
import PostContentContainer from '../PostContentContainer';
import usePostContent from '../../../hooks/usePostContent';
import { BasePostContent } from '../BasePostContent';
import { useMemberRoleForSource } from '../../../hooks/useMemberRoleForSource';
import SquadPostAuthor from '../SquadPostAuthor';
import { SquadPostWidgets } from '../SquadPostWidgets';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PostContentProps, PostNavigationProps } from '../common';
import { useViewPost } from '../../../hooks/post';
import { withPostById } from '../withPostById';
import PostSourceInfo from '../PostSourceInfo';
import { isSourceUserSource } from '../../../graphql/sources';
import { ProfileImageSize } from '../../ProfilePicture';
import { BoostNewPostStrip } from '../../../features/boost/BoostNewPostStrip';
import { useActions, useViewSize, ViewSize } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useShowBoostButton } from '../../../features/boost/useShowBoostButton';
import usePoll from '../../../hooks/usePoll';
import PollOptions from '../../cards/poll/PollOptions';
import PostMetadata from '../../cards/common/PostMetadata';
import { PostTagList } from '../tags/PostTagList';
import { Typography, TypographyType } from '../../typography/Typography';

function PollPostContentRaw({
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
  const { role } = useMemberRoleForSource({
    source: post?.source,
    user: post?.author,
  });
  const { onVote, isCastingVote } = usePoll({ post });

  const navigationProps: PostNavigationProps = {
    post,
    onPreviousPost,
    onNextPost,
    postPosition,
    onClose,
    inlineActions,
  };
  const isUserSource = isSourceUserSource(post?.source);

  const handleVote = (optionId: string) => {
    if (!isCastingVote) {
      onVote(optionId);
    }
  };

  useEffect(() => {
    if (!post?.id || !user?.id) {
      return;
    }

    onSendViewPost(post.id);
  }, [post.id, onSendViewPost, user?.id]);

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
              className={
                !isUserSource &&
                (shouldShowBanner && isLaptop ? 'mb-4' : 'mb-6')
              }
            />
            {shouldShowBanner && !isUserSource && isLaptop && (
              <BoostNewPostStrip />
            )}
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
          {shouldShowBanner && isUserSource && isLaptop && (
            <BoostNewPostStrip className="mt-2" />
          )}
          <div className="mt-6">
            <Typography
              type={TypographyType.LargeTitle}
              bold
              data-testid="post-modal-title"
            >
              {post?.title}
            </Typography>
            <PostTagList post={post} />
            <div className="mb-5 mt-4">
              <PostMetadata
                numPollVotes={post.numPollVotes}
                isPoll
                endsAt={post.endsAt}
                createdAt={post.createdAt}
                isAuthor={user?.id === post.author?.id}
                className="mb-6"
              />
              <PollOptions
                options={post.pollOptions}
                onClick={handleVote}
                userVote={post?.userState?.pollVoteOptionId}
                numPollVotes={post.numPollVotes || 0}
                endsAt={post?.endsAt}
              />
            </div>
          </div>
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

export const PollPostContent = withPostById(PollPostContentRaw);
