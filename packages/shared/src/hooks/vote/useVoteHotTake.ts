import { useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import type { HotTake } from '../../graphql/user/userHotTake';
import type { Connection } from '../../graphql/common';
import type { UseVoteProps, ToggleVoteProps } from './types';
import { UserVoteEntity } from './types';
import { useVote } from './useVote';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';

const hotTakeMutationHandlers: Record<
  UserVote,
  (hotTake: HotTake) => Partial<HotTake>
> = {
  [UserVote.Up]: (hotTake) => ({
    upvotes: hotTake.upvotes + 1,
    upvoted: true,
  }),
  [UserVote.Down]: (hotTake) => ({
    upvotes: hotTake.upvoted ? hotTake.upvotes - 1 : hotTake.upvotes,
    upvoted: false,
  }),
  [UserVote.None]: (hotTake) => ({
    upvotes: hotTake.upvoted ? hotTake.upvotes - 1 : hotTake.upvotes,
    upvoted: false,
  }),
};

export interface UseVoteHotTakeProps extends Pick<UseVoteProps, 'onMutate'> {
  variables?: unknown;
}

export interface UseVoteHotTake {
  upvoteHotTake: (props: { id: string }) => Promise<void>;
  downvoteHotTake: (props: { id: string }) => Promise<void>;
  cancelHotTakeVote: (props: { id: string }) => Promise<void>;
  toggleUpvote: (
    props: Omit<ToggleVoteProps<HotTake>, 'entity'>,
  ) => Promise<void>;
  toggleDownvote: (
    props: Omit<ToggleVoteProps<HotTake>, 'entity'>,
  ) => Promise<void>;
}

const useVoteHotTake = ({
  onMutate,
  variables,
}: UseVoteHotTakeProps = {}): UseVoteHotTake => {
  const client = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { logEvent } = useLogContext();

  const defaultOnMutate = ({ id, vote }) => {
    const mutationHandler = hotTakeMutationHandlers[vote];

    if (!mutationHandler) {
      return undefined;
    }

    // Find and update the hot take in cache
    const queryKeys = client
      .getQueryCache()
      .findAll({ queryKey: ['user_hot_takes'] });

    let previousVote: UserVote | undefined;

    queryKeys.forEach((query) => {
      const data = query.state.data as Connection<HotTake>;
      if (!data?.edges) {
        return;
      }

      const hotTakeEdge = data.edges.find((edge) => edge.node.id === id);

      if (hotTakeEdge) {
        previousVote = hotTakeEdge.node.upvoted ? UserVote.Up : UserVote.None;

        client.setQueryData(query.queryKey, {
          ...data,
          edges: data.edges.map((edge) =>
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
        });
      }
    });

    return () => {
      const rollbackMutationHandler = hotTakeMutationHandlers[previousVote];

      if (!rollbackMutationHandler) {
        return;
      }

      queryKeys.forEach((query) => {
        const data = query.state.data as Connection<HotTake>;
        if (!data?.edges) {
          return;
        }

        client.setQueryData(query.queryKey, {
          ...data,
          edges: data.edges.map((edge) =>
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
    async ({ payload: hotTake, origin }) => {
      if (!hotTake) {
        return;
      }

      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });
        return;
      }

      if (hotTake?.upvoted) {
        await cancelHotTakeVote({ id: hotTake.id });
        logEvent({
          event_name: LogEvent.RemoveHotTakeUpvote,
          target_id: origin || Origin.HotTakeList,
          extra: JSON.stringify({ id: hotTake.id }),
        });
        return;
      }

      await upvoteHotTake({ id: hotTake.id });
      logEvent({
        event_name: LogEvent.UpvoteHotTake,
        target_id: origin || Origin.HotTakeList,
        extra: JSON.stringify({ id: hotTake.id }),
      });
    },
    [cancelHotTakeVote, logEvent, showLogin, upvoteHotTake, user],
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

      // Hot takes don't support downvotes, just cancel the vote
      await cancelHotTakeVote({ id: hotTake.id });
    },
    [cancelHotTakeVote, showLogin, user],
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
