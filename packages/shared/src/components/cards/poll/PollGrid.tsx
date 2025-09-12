import type { Ref } from 'react';
import React, { forwardRef } from 'react';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardTextContainer,
  FreeformCardTitle,
  getPostClassNames,
} from '../common/Card';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import ActionButtons from '../ActionsButtons';
import PollOptions from './PollOptions';
import PostMetadata from '../common/PostMetadata';
import { useAuthContext } from '../../../contexts/AuthContext';
import usePoll from '../../../hooks/usePoll';

const PollGrid = forwardRef(function PollCard(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onShare,
    onCopyLinkClick,
    openNewTab,
    onReadArticleClick,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const { user } = useAuthContext();
  const { onVote, isCastingVote } = usePoll({ post });

  const handleVote = (optionId: string) => {
    if (!isCastingVote) {
      onVote(optionId);
    }
  };

  const {
    title,
    pinnedAt,
    trending,
    pollOptions,
    endsAt,
    numPollVotes,
    source,
  } = post;

  return (
    <FeedItemContainer
      ref={ref}
      domProps={{
        ...domProps,
        className: getPostClassNames(post, domProps?.className, 'min-h-card'),
      }}
      flagProps={{ pinnedAt, trending }}
    >
      <SquadPostCardHeader
        post={post}
        enableSourceHeader={source.type === 'squad'}
      />
      <CardTextContainer>
        <FreeformCardTitle>{title}</FreeformCardTitle>
      </CardTextContainer>
      <Container className="justify-end gap-2">
        <PostMetadata
          numPollVotes={numPollVotes}
          isPoll
          endsAt={endsAt}
          createdAt={post.createdAt}
          className="mx-4"
          isAuthor={user?.id === post.author?.id}
        />
        <PollOptions
          options={pollOptions}
          onClick={handleVote}
          userVote={post?.userState?.pollVoteOptionId}
          numPollVotes={numPollVotes || 0}
        />
        <ActionButtons
          post={post}
          onUpvoteClick={onUpvoteClick}
          onCommentClick={onCommentClick}
          onCopyLinkClick={onCopyLinkClick}
          onBookmarkClick={onBookmarkClick}
          onDownvoteClick={onDownvoteClick}
        />
      </Container>
    </FeedItemContainer>
  );
});

export default PollGrid;
