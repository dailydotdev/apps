import type { ReactElement, Ref } from 'react';
import React, { forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import { useFeedPreviewMode, useViewSize, ViewSize } from '../../../hooks';
import FeedItemContainer from '../common/list/FeedItemContainer';
import { combinedClicks } from '../../../lib/click';
import { CardContainer, CardContent, CardTitle } from '../common/list/ListCard';
import { PostCardHeader } from '../common/list/PostCardHeader';
import SourceButton from '../common/SourceButton';
import { ProfileImageSize } from '../../ProfilePicture';
import ActionButtons from '../common/list/ActionButtons';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { isSourceUserSource } from '../../../graphql/sources';
import { useAuthContext } from '../../../contexts/AuthContext';
import usePoll from '../../../hooks/usePoll';
import PollOptions from './PollOptions';
import PostMetadata from '../common/PostMetadata';

export const PollList = forwardRef(function PollList(
  {
    post,
    onPostClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onCopyLinkClick,
    openNewTab,
    onReadArticleClick,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { className, style } = domProps;
  const { type, pinnedAt, trending } = post;
  const { user } = useAuthContext();
  const { onVote, isCastingVote } = usePoll({ post });

  const handleVote = (optionId: string, text: string) => {
    if (!isCastingVote) {
      onVote(optionId, text);
    }
  };

  const onPostCardClick = () => onPostClick?.(post);
  const isMobile = useViewSize(ViewSize.MobileL);
  const isFeedPreview = useFeedPreviewMode();
  const { title } = useSmartTitle(post);
  const isUserSource = isSourceUserSource(post.source);

  const actionButtons = (
    <Container className="pointer-events-none flex-[unset] tablet:mt-4">
      <ActionButtons
        className="mt-4 justify-between tablet:mt-0"
        post={post}
        onUpvoteClick={onUpvoteClick}
        onDownvoteClick={onDownvoteClick}
        onCommentClick={onCommentClick}
        onCopyLinkClick={onCopyLinkClick}
        onBookmarkClick={onBookmarkClick}
      />
    </Container>
  );

  const metadata = useMemo(() => {
    if (isUserSource) {
      return {
        topLabel: post.author.name,
      };
    }

    return {
      topLabel: post.source.name,
      bottomLabel: (
        <PostMetadata
          numPollVotes={post.numPollVotes}
          createdAt={post.createdAt}
          pollMetadata={{
            endsAt: post?.endsAt,
            isAuthor: user?.id === post.author?.id,
            numPollVotes: post?.numPollVotes,
          }}
        />
      ),
    };
  }, [isUserSource, post, user?.id]);

  return (
    <FeedItemContainer
      domProps={{
        ...domProps,
        style,
        className,
      }}
      ref={ref}
      flagProps={{ pinnedAt, trending, type }}
      linkProps={
        !isFeedPreview && {
          title: post.title,
          href: post.commentsPermalink,
          ...combinedClicks(onPostCardClick),
        }
      }
      bookmarked={post.bookmarked}
    >
      <CardContainer>
        <PostCardHeader
          post={{ ...post, createdAt: undefined }}
          openNewTab={openNewTab}
          postLink={post.permalink}
          onReadArticleClick={onReadArticleClick}
          metadata={metadata}
        >
          {!isUserSource && (
            <SourceButton
              size={ProfileImageSize.Large}
              source={post.source}
              className="relative"
            />
          )}
        </PostCardHeader>
        <CardContent>
          <div className="mr-4 flex flex-1 flex-col">
            <CardTitle lineClamp={undefined} className={classNames('mb-4')}>
              {title}
            </CardTitle>
            <PollOptions
              options={post.pollOptions}
              onClick={handleVote}
              userVote={post?.userState?.pollOption?.id}
              numPollVotes={post.numPollVotes || 0}
              endsAt={post?.endsAt}
            />
            {!isMobile && actionButtons}
          </div>
        </CardContent>
      </CardContainer>
      {isMobile && actionButtons}
    </FeedItemContainer>
  );
});
