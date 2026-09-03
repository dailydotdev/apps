import { useContext, useCallback } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { UserVote } from '../../graphql/posts';
import { AuthTriggers } from '../../lib/auth';
import type { HotTake } from '../../graphql/user/userHotTake';
import type { ProfileShowcase } from '../../graphql/user/profileShowcase';
import type {
  UseVoteProps,
  ToggleVoteProps,
  UseVoteMutationProps,
} from './types';
import { UserVoteEntity } from './types';
import { useVote } from './useVote';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin } from '../../lib/log';
import { RequestKey } from '../../lib/query';

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

// The profile's hot takes live in the shared ProfileShowcase cache, one entry
// per viewed profile — apply the vote to every entry that holds this hot take.
const updateShowcaseHotTake = (
  client: QueryClient,
  id: string,
  handler: (hotTake: HotTake) => Partial<HotTake>,
): UserVote | undefined => {
  let previousVote: UserVote | undefined;

  client
    .getQueryCache()
    .findAll({ queryKey: [RequestKey.ProfileShowcase] })
    .forEach((query) => {
      const data = query.state.data as ProfileShowcase | undefined;

      if (!data) {
        return;
      }

      const edge = data.hotTakes?.edges?.find((item) => item.node.id === id);

      if (!edge) {
        return;
      }

      previousVote = edge.node.upvoted ? UserVote.Up : UserVote.None;

      client.setQueryData<ProfileShowcase>(query.queryKey, {
        ...data,
        hotTakes: {
          ...data.hotTakes,
          edges: data.hotTakes.edges.map((item) =>
            item.node.id === id
              ? { ...item, node: { ...item.node, ...handler(item.node) } }
              : item,
          ),
        },
      });
    });

  return previousVote;
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

  const defaultOnMutate: NonNullable<UseVoteProps['onMutate']> = ({
    id,
    vote,
  }: UseVoteMutationProps) => {
    const mutationHandler = hotTakeMutationHandlers[vote];

    if (!mutationHandler) {
      return undefined;
    }

    const previousVote = updateShowcaseHotTake(client, id, mutationHandler);

    return () => {
      if (typeof previousVote === 'undefined') {
        return;
      }

      const rollbackMutationHandler = hotTakeMutationHandlers[previousVote];

      if (!rollbackMutationHandler) {
        return;
      }

      updateShowcaseHotTake(client, id, rollbackMutationHandler);
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
          target_id: hotTake.title,
          extra: JSON.stringify({ origin: origin || Origin.HotTakeList }),
        });
        return;
      }

      await upvoteHotTake({ id: hotTake.id });
      logEvent({
        event_name: LogEvent.UpvoteHotTake,
        target_id: hotTake.title,
        extra: JSON.stringify({ origin: origin || Origin.HotTakeList }),
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

      await downvoteHotTake({ id: hotTake.id });
    },
    [downvoteHotTake, showLogin, user],
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
