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
import CardOverlay from '../common/CardOverlay';

const PollGrid = forwardRef(function PollCard(
  {
    post,
    onPostClick,
    onPostAuxClick,
    onUpvoteClick,
    onDownvoteClick,
    onCommentClick,
    onBookmarkClick,
    onCopyLinkClick,
    domProps = {},
  }: PostCardProps,
  ref: Ref<HTMLElement>,
) {
  const { user } = useAuthContext();
  const { onVote, isCastingVote } = usePoll({ post });

  const handleVote = (optionId: string, text: string) => {
    if (!isCastingVote) {
      onVote(optionId, text);
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
      <CardOverlay
        post={post}
        onPostCardAuxClick={() => onPostAuxClick(post)}
        onPostCardClick={() => onPostClick(post)}
      />
      <SquadPostCardHeader
        post={post}
        enableSourceHeader={source.type === 'squad'}
      />
      <CardTextContainer>
        <FreeformCardTitle className={post?.read && 'text-text-quaternary'}>
          {title}
        </FreeformCardTitle>
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
          className={{
            container: 'px-2',
          }}
          options={pollOptions}
          onClick={handleVote}
          userVote={post?.userState?.pollOption?.id}
          numPollVotes={numPollVotes || 0}
          endsAt={endsAt}
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
