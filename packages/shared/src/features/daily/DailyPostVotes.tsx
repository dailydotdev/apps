import type { ReactElement } from 'react';
import React from 'react';
import { UpvoteIcon, DownvoteIcon } from '../../components/icons';
import { IconSize } from '../../components/Icon';
import { CardAction } from '../../components/buttons/CardAction';
import { ButtonColor } from '../../components/buttons/Button';
import { Tooltip } from '../../components/tooltip/Tooltip';
import { useVotePost } from '../../hooks/vote/useVotePost';
import type { UseVotePostProps } from '../../hooks/vote/types';
import type { Post } from '../../graphql/posts';
import { UserVote } from '../../graphql/posts';
import type { Origin } from '../../lib/log';
import type { PostLogEventFnOptions } from '../../lib/feed';

interface DailyPostVotesProps {
  post: Post;
  origin: Origin;
  opts?: PostLogEventFnOptions;
  onMutate?: UseVotePostProps['onMutate'];
}

export const DailyPostVotes = ({
  post,
  origin,
  opts,
  onMutate,
}: DailyPostVotesProps): ReactElement => {
  const { toggleUpvote, toggleDownvote } = useVotePost({ onMutate });
  const vote = post.userState?.vote ?? UserVote.None;
  const isUpvoteActive = vote === UserVote.Up;
  const isDownvoteActive = vote === UserVote.Down;

  return (
    <div className="flex items-center gap-1">
      <Tooltip content={isUpvoteActive ? 'Remove upvote' : 'Upvote'}>
        <CardAction
          density="compact"
          color={ButtonColor.Avocado}
          pressed={isUpvoteActive}
          onClick={() => toggleUpvote({ payload: post, origin, opts })}
          icon={<UpvoteIcon size={IconSize.Small} />}
          iconPressed={<UpvoteIcon size={IconSize.Small} secondary />}
          label={isUpvoteActive ? 'Remove upvote' : 'Upvote'}
        />
      </Tooltip>
      <Tooltip content={isDownvoteActive ? 'Remove downvote' : 'Downvote'}>
        <CardAction
          density="compact"
          color={ButtonColor.Ketchup}
          pressed={isDownvoteActive}
          onClick={() => toggleDownvote({ payload: post, origin, opts })}
          icon={<DownvoteIcon size={IconSize.Small} />}
          iconPressed={<DownvoteIcon size={IconSize.Small} secondary />}
          label={isDownvoteActive ? 'Remove downvote' : 'Downvote'}
        />
      </Tooltip>
    </div>
  );
};
