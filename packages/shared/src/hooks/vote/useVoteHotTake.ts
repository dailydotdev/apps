import { useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import type { UserHotTake } from '../../graphql/user/userHotTake';
import type { Connection } from '../../graphql/common';
import type { UseVoteProps, ToggleVoteProps } from './types';
import { voteMutationHandlers, UserVoteEntity } from './types';
import { useVote } from './useVote';

export interface UseVoteHotTakeProps extends Pick<UseVoteProps, 'onMutate'> {
  variables?: unknown;
}

export interface UseVoteHotTake {
  upvoteHotTake: (props: { id: string }) => Promise<void>;
  downvoteHotTake: (props: { id: string }) => Promise<void>;
  cancelHotTakeVote: (props: { id: string }) => Promise<void>;
  toggleUpvote: (
    props: Omit<ToggleVoteProps<UserHotTake>, 'entity'>,
  ) => Promise<void>;
  toggleDownvote: (
    props: Omit<ToggleVoteProps<UserHotTake>, 'entity'>,
  ) => Promise<void>;
}

const useVoteHotTake = ({
  onMutate,
  variables,
}: UseVoteHotTakeProps = {}): UseVoteHotTake => {
  const client = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);

  const defaultOnMutate = ({ id, vote }) => {
    const mutationHandler = voteMutationHandlers[vote];

    if (!mutationHandler) {
      return undefined;
    }

    // Find and update the hot take in cache
    const queryKeys = client
      .getQueryCache()
      .findAll({ queryKey: ['userHotTakes'] });

    let previousVote: UserVote | undefined;

    queryKeys.forEach((query) => {
      const data = query.state.data as {
        userHotTakes: Connection<UserHotTake>;
      };
      if (!data?.userHotTakes?.edges) {
        return;
      }

      const hotTakeEdge = data.userHotTakes.edges.find(
        (edge) => edge.node.id === id,
      );

      if (hotTakeEdge) {
        previousVote = hotTakeEdge.node.userState?.vote;

        client.setQueryData(query.queryKey, {
          ...data,
          userHotTakes: {
            ...data.userHotTakes,
            edges: data.userHotTakes.edges.map((edge) =>
              edge.node.id === id
                ? {
                    ...edge,
                    node: {
                      ...edge.node,
                      ...mutationHandler(edge.node),
                    },
                  }
                : edge,
            ),
          },
        });
      }
    });

    return () => {
      const rollbackMutationHandler = voteMutationHandlers[previousVote];

      if (!rollbackMutationHandler) {
        return;
      }

      queryKeys.forEach((query) => {
        const data = query.state.data as {
          userHotTakes: Connection<UserHotTake>;
        };
        if (!data?.userHotTakes?.edges) {
          return;
        }

        client.setQueryData(query.queryKey, {
          ...data,
          userHotTakes: {
            ...data.userHotTakes,
            edges: data.userHotTakes.edges.map((edge) =>
              edge.node.id === id
                ? {
                    ...edge,
                    node: {
                      ...edge.node,
                      ...rollbackMutationHandler(edge.node),
                    },
                  }
                : edge,
            ),
          },
        });
      });
    };
  };

  const {
    upvote: upvoteHotTake,
    downvote: downvoteHotTake,
    cancelVote: cancelHotTakeVote,
  } = useVote({
    onMutate: onMutate || defaultOnMutate,
    entity: UserVoteEntity.HotTake,
    variables,
  });

  const toggleUpvote: UseVoteHotTake['toggleUpvote'] = useCallback(
    async ({ payload: hotTake }) => {
      if (!hotTake) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });
        return;
      }

      if (hotTake?.userState?.vote === UserVote.Up) {
        await cancelHotTakeVote({ id: hotTake.id });
        return;
      }

      await upvoteHotTake({ id: hotTake.id });
    },
    [cancelHotTakeVote, showLogin, upvoteHotTake, user],
  );

  const toggleDownvote: UseVoteHotTake['toggleDownvote'] = useCallback(
    async ({ payload: hotTake }) => {
      if (!hotTake) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Downvote });
        return;
      }

      if (hotTake?.userState?.vote === UserVote.Down) {
        await cancelHotTakeVote({ id: hotTake.id });
        return;
      }

      await downvoteHotTake({ id: hotTake.id });
    },
    [cancelHotTakeVote, downvoteHotTake, showLogin, user],
  );

  return {
    upvoteHotTake,
    downvoteHotTake,
    cancelHotTakeVote,
    toggleUpvote,
    toggleDownvote,
  };
};

export { useVoteHotTake };
