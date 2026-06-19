import type { Ref } from 'react';
import React, { forwardRef } from 'react';
import classNames from 'classnames';
import FeedItemContainer from '../common/FeedItemContainer';
import {
  CardTextContainer,
  CardTitle,
  getPostClassNames,
} from '../common/Card';
import { SquadPostCardHeader } from '../common/SquadPostCardHeader';
import type { PostCardProps } from '../common/common';
import { Container } from '../common/common';
import ActionButtons from '../common/ActionButtons';
import { FeedCardGlassActions } from '../common/FeedCardGlassActions';
import PollOptions from './PollOptions';
import PostMetadata from '../common/PostMetadata';
import { useAuthContext } from '../../../contexts/AuthContext';
import CardOverlay from '../common/CardOverlay';
import { useSmartTitle } from '../../../hooks/post/useSmartTitle';
import { usePollVote } from '../../../hooks/post/usePollVote';
import { isSourceSquadOrMachine } from '../../../graphql/sources';
import { useFeedCardGlassActions } from '../../../hooks/useFeedCardGlassActions';

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
  const { handleVote, shouldAnimateResults } = usePollVote({ post });
  const { title } = useSmartTitle(post);
  const useGlass = useFeedCardGlassActions();

  const { pinnedAt, trending, pollOptions, endsAt, numPollVotes, source } =
    post;

  return (
    <FeedItemContainer
      ref={ref}
      domProps={{
        ...domProps,
        className: getPostClassNames(
          post,
          domProps?.className ?? '',
          useGlass ? 'min-h-cardGlass' : 'min-h-card',
        ),
      }}
      flagProps={{ pinnedAt, trending }}
    >
      <CardOverlay
        post={post}
        onPostCardAuxClick={() => onPostAuxClick?.(post)}
        onPostCardClick={() => onPostClick?.(post)}
      />
      <CardTextContainer>
        <SquadPostCardHeader
          post={post}
          enableSourceHeader={isSourceSquadOrMachine(source)}
        />
        <CardTitle>{title}</CardTitle>
      </CardTextContainer>
      <Container
        className={classNames('justify-end gap-2', useGlass && 'pb-12')}
      >
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
          options={pollOptions ?? []}
          onClick={handleVote}
          userVote={post?.userState?.pollOption?.id}
          numPollVotes={numPollVotes || 0}
          endsAt={endsAt}
          shouldAnimateResults={shouldAnimateResults}
        />
        {useGlass ? (
          <FeedCardGlassActions
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
          />
        ) : (
          <ActionButtons
            post={post}
            onUpvoteClick={onUpvoteClick}
            onCommentClick={onCommentClick}
            onCopyLinkClick={onCopyLinkClick}
            onBookmarkClick={onBookmarkClick}
            onDownvoteClick={onDownvoteClick}
          />
        )}
      </Container>
    </FeedItemContainer>
  );
});

export default PollGrid;
