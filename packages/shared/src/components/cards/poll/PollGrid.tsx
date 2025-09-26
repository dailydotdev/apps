import type { Ref } from 'react';
import React, { forwardRef, useState } from 'react';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardTextContainer,
  CardTitle,
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
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { useViewPost } from '../../../hooks/post';

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
  const [shouldAnimateResults, setShouldAnimateResults] = useState(false);
  const onSendViewPost = useViewPost();

  const handleVote = (optionId: string, text: string) => {
    if (!isCastingVote) {
      onVote(optionId, text);
      setShouldAnimateResults(true);

      if (!post?.id || !user?.id) {
        return;
      }
      onSendViewPost(post.id);
    }
  };
  const { title } = useSmartTitle(post);

  const { pinnedAt, trending, pollOptions, endsAt, numPollVotes, source } =
    post;

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
        <CardTitle>{title}</CardTitle>
      </CardTextContainer>
      <Container className="justify-end gap-2">
        <PostMetadata
          createdAt={post.createdAt}
          className="mx-4"
          pollMetadata={{
            endsAt,
            isAuthor: user?.id === post.author?.id,
            numPollVotes,
          }}
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
          shouldAnimateResults={shouldAnimateResults}
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
