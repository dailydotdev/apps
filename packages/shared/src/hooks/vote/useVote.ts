import { useContext, useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import { graphqlUrl } from '../../lib/config';
import { useRequestProtocol } from '../useRequestProtocol';
import {
  UseVoteMutationProps,
  VoteProps,
  UseVote,
  UseVoteProps,
  createVoteMutationKey,
  UserVoteEntity,
} from './types';
import { VOTE_MUTATION } from '../../graphql/users';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';

const useVote = ({ onMutate, entity, variables }: UseVoteProps): UseVote => {
  const { requestMethod } = useRequestProtocol();
  const [isVoting, setIsVoting] = useState(false);
  const { user, showLogin } = useContext(AuthContext);
  const mutationKey = createVoteMutationKey({ entity, variables });
  const { completeAction } = useActions();

  const { mutateAsync: voteEntity } = useMutation(
    (mutationProps: UseVoteMutationProps) => {
      if (isVoting) {
        return Promise.resolve(null);
      }

      setIsVoting(true);

      if (mutationProps.entity === UserVoteEntity.Post) {
        completeAction(ActionType.VotePost);
      }

      return requestMethod(graphqlUrl, VOTE_MUTATION, mutationProps);
    },
    {
      mutationKey,
      onMutate,
      onSuccess: () => setIsVoting(false),
      onError: (err, _, rollback?: () => void) => rollback?.(),
    },
  );

  const upvote = useCallback(
    ({ id }: VoteProps) => {
      console.log('got here');
      return voteEntity({ id, vote: UserVote.Up, entity });
    },
    [voteEntity, entity],
  );
  const downvote = useCallback(
    ({ id }: VoteProps) => {
      return voteEntity({ id, vote: UserVote.Down, entity });
    },
    [voteEntity, entity],
  );
  const cancelVote = useCallback(
    ({ id }: VoteProps) => {
      return voteEntity({ id, vote: UserVote.None, entity });
    },
    [voteEntity, entity],
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
        await cancelVote({ id: payload.id });

        return;
      }

      await upvote({ id: payload.id });
    },
    [cancelVote, showLogin, upvote, user],
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
        await cancelVote({ id: payload.id });

        return;
      }

      await downvote({ id: payload.id });
    },
    [cancelVote, downvote, showLogin, user],
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
