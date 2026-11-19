import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import type { Post } from '../../../graphql/posts';
import usePoll from '../../../hooks/usePoll';
import PollOptions from '../../cards/poll/PollOptions';
import { PollSnapshotButton } from '../../../features/snapshot/PollSnapshotButton';
import { Origin } from '../../../lib/log';
import { Typography } from '../../typography/Typography';
import { DiscussIcon } from '../../icons';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

/** The classic poll block: options, results snapshot and the vote prompt. */
export const PostHybridPoll = ({ post }: { post: Post }): ReactElement => {
  const router = useRouter();
  const { onVote, isCastingVote } = usePoll({ post });
  const [justVoted, setJustVoted] = useState(false);
  const [shouldAnimateResults, setShouldAnimateResults] = useState(false);
  const hasPollResults = !!post.numPollVotes;

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

  return (
    <div className="flex flex-col gap-2">
      <PollOptions
        options={post.pollOptions ?? []}
        onClick={handleVote}
        userVote={post.userState?.pollOption?.id}
        numPollVotes={post.numPollVotes || 0}
        endsAt={post.endsAt}
        shouldAnimateResults={shouldAnimateResults}
      />
      {hasPollResults && (
        <div className="flex justify-end">
          <PollSnapshotButton
            origin={Origin.PollResults}
            post={post}
            showLabel={false}
          />
        </div>
      )}
      {justVoted && (
        <div className="flex items-center justify-between rounded-16 bg-action-comment-float p-3">
          <div className="flex items-center gap-1">
            <DiscussIcon secondary className="text-action-comment-default" />
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
  );
};
