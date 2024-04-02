import { useContext, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import { graphqlUrl } from '../../lib/config';
import { useRequestProtocol } from '../useRequestProtocol';
import {
  UseVoteMutationProps,
  upvoteMutationKey,
  VoteProps,
  UseVote,
  UseVoteProps,
} from './types';
import { VOTE_MUTATION } from '../../graphql/users';

const useVote = ({ onMutate, entity, variables }: UseVoteProps): UseVote => {
  const { requestMethod } = useRequestProtocol();
  const { user, showLogin } = useContext(AuthContext);

  const { mutateAsync: voteEntity } = useMutation(
    ({ id, vote }: UseVoteMutationProps) => {
      return requestMethod(graphqlUrl, VOTE_MUTATION, {
        id,
        vote,
        entity,
      });
    },
    {
      mutationKey: variables
        ? [...upvoteMutationKey, variables]
        : upvoteMutationKey,
      onMutate,
      onError: (err, _, rollback?: () => void) => rollback?.(),
    },
  );

  const upvote = useCallback(
    ({ id }: VoteProps) => {
      return voteEntity({ id, vote: UserVote.Up });
    },
    [voteEntity],
  );
  const downvote = useCallback(
    ({ id }: VoteProps) => {
      return voteEntity({ id, vote: UserVote.Down });
    },
    [voteEntity],
  );
  const cancelVote = useCallback(
    ({ id }: VoteProps) => {
      return voteEntity({ id, vote: UserVote.None });
    },
    [voteEntity],
  );

  const toggleUpvote: UseVote['toggleUpvote'] = useCallback(
    async ({ payload }) => {
      if (!payload) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });

        return;
      }

      if (payload?.userState?.vote === UserVote.Up) {
        await cancelVote({ id: payload.id, entity });

        return;
      }

      await upvote({ id: payload.id, entity });
    },
    [cancelVote, showLogin, upvote, user, entity],
  );

  const toggleDownvote = useCallback(
    async ({ payload }) => {
      if (!payload) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Downvote });

        return;
      }

      if (payload?.userState?.vote === UserVote.Down) {
        await cancelVote({ id: payload.id, entity });

        return;
      }

      await downvote({ id: payload.id, entity });
    },
    [cancelVote, downvote, showLogin, user, entity],
  );

  return {
    upvote,
    downvote,
    cancelVote,
    toggleUpvote,
    toggleDownvote,
  };
};

export { useVote };
