import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import PostContentContainer from '../PostContentContainer';
import usePostContent from '../../../hooks/usePostContent';
import { BasePostContent } from '../BasePostContent';
import { useMemberRoleForSource } from '../../../hooks/useMemberRoleForSource';
import SquadPostAuthor from '../SquadPostAuthor';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { PostContentProps, PostNavigationProps } from '../common';
import { useViewPost } from '../../../hooks/post';
import { withPostById } from '../withPostById';
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
import { Typography } from '../../typography/Typography';
import { DiscussIcon } from '../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import type { Post } from '../../../graphql/posts';
import { PostExperienceLayout } from '../experience/PostExperienceLayout';
import { PostHero } from '../experience/PostHero';
import { PostContextRail } from '../experience/PostContextRail';
import { PersonalizedFeedPreview } from '../experience/PersonalizedFeedPreview';

type PollPostContentRawProps = Omit<PostContentProps, 'post'> & { post: Post };

function PollPostContentRaw({
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
}: PollPostContentRawProps): ReactElement {
  const [justVoted, setJustVoted] = useState(false);
  const [shouldAnimateResults, setShouldAnimateResults] = useState(false);
  const router = useRouter();
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
  const pollMetaWrapperClassName = isCompactModalSpacing
    ? 'mb-4 mt-3'
    : 'mb-5 mt-4';

  const handleVote = (optionId: string, text: string) => {
    if (!isCastingVote) {
      onVote(optionId, text);
      setJustVoted(true);
      setShouldAnimateResults(true);
    }
  };

  const handleCommentClick = () => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, comment: '' },
      },
      undefined,
      { shallow: true },
    );
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
                title={post?.title ?? 'Poll'}
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
                <SquadPostAuthor
                  author={post?.author}
                  className={{
                    container: isUserSource ? 'shrink truncate' : undefined,
                  }}
                  date={post.createdAt}
                  isUserSource={isUserSource}
                  role={role}
                  size={ProfileImageSize.Large}
                />
              </div>
              <div className={pollMetaWrapperClassName}>
                <PostMetadata
                  pollMetadata={{
                    endsAt: post?.endsAt,
                    isAuthor: user?.id === post.author?.id,
                    numPollVotes: post?.numPollVotes,
                  }}
                  createdAt={post.createdAt}
                  className="mb-6"
                />
                <PostTagList post={post} />
                <PollOptions
                  options={post.pollOptions ?? []}
                  onClick={handleVote}
                  userVote={post?.userState?.pollOption?.id}
                  numPollVotes={post.numPollVotes || 0}
                  endsAt={post?.endsAt}
                  shouldAnimateResults={shouldAnimateResults}
                />
                {justVoted && (
                  <div className="mt-2 flex items-center justify-between rounded-16 bg-action-comment-float p-3">
                    <div className="flex items-center gap-1">
                      <DiscussIcon
                        secondary
                        className="text-action-comment-default"
                      />
                      <Typography bold>Why did you vote this way?</Typography>
                    </div>
                    <Button
                      className="text-text-primary"
                      variant={ButtonVariant.Subtle}
                      size={ButtonSize.XSmall}
                      type="button"
                      onClick={handleCommentClick}
                    >
                      Comment
                    </Button>
                  </div>
                )}
              </div>
            </section>
            <PersonalizedFeedPreview post={post} />
          </PostExperienceLayout>
        </BasePostContent>
      </div>
    </PostContentContainer>
  );
}

export const PollPostContent = withPostById(PollPostContentRaw);
