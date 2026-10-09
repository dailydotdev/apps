import { useCallback, useContext } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { UserVote } from '../../graphql/posts';
import type { Plugin } from '../../graphql/plugins';
import { AuthTriggers } from '../../lib/auth';
import { RequestKey } from '../../lib/query';
import { LogEvent, TargetType } from '../../lib/log';
import { useLogContext } from '../../contexts/LogContext';
import type { UseVoteMutationProps, UseVoteProps } from './types';
import { UserVoteEntity } from './types';
import { useVote } from './useVote';

const applyPluginVote = (plugin: Plugin, vote: UserVote): Plugin => {
  const wasUpvoted = plugin.userVote === UserVote.Up;
  const isUpvoted = vote === UserVote.Up;

  return {
    ...plugin,
    userVote: vote,
    upvotes: plugin.upvotes + Number(isUpvoted) - Number(wasUpvoted),
  };
};

const updateCachedPlugin = (
  client: QueryClient,
  id: string,
  vote: UserVote,
): UserVote | undefined => {
  let previousVote: UserVote | undefined;
  const update = (plugin: Plugin): Plugin => {
    if (plugin.id !== id) {
      return plugin;
    }

    previousVote = plugin.userVote ?? UserVote.None;

    return applyPluginVote(plugin, vote);
  };

  client.setQueriesData<Plugin[]>(
    { queryKey: [RequestKey.Plugins] },
    (plugins) => plugins?.map(update),
  );
  client.setQueriesData<Plugin>({ queryKey: [RequestKey.Plugin] }, (plugin) =>
    plugin ? update(plugin) : plugin,
  );

  return previousVote;
};

interface UseVotePlugin {
  toggleUpvote: (plugin: Plugin) => Promise<void>;
}

export const useVotePlugin = (): UseVotePlugin => {
  const client = useQueryClient();
  const { user, showLogin } = useContext(AuthContext);
  const { logEvent } = useLogContext();

  const onMutate: NonNullable<UseVoteProps['onMutate']> = ({
    id,
    vote,
  }: UseVoteMutationProps) => {
    const previousVote = updateCachedPlugin(client, id, vote);

    return () => {
      if (typeof previousVote === 'undefined') {
        return;
      }

      updateCachedPlugin(client, id, previousVote);
    };
  };

  const { upvote, cancelVote } = useVote({
    onMutate,
    entity: UserVoteEntity.Plugin,
  });

  const toggleUpvote: UseVotePlugin['toggleUpvote'] = useCallback(
    async (plugin) => {
      if (!user) {
        showLogin({ trigger: AuthTriggers.Upvote });
        return;
      }

      const isUpvoted = plugin.userVote === UserVote.Up;

      if (isUpvoted) {
        await cancelVote({ id: plugin.id });
      } else {
        await upvote({ id: plugin.id });
      }

      logEvent({
        event_name: isUpvoted
          ? LogEvent.RemovePluginUpvote
          : LogEvent.UpvotePlugin,
        target_type: TargetType.Plugin,
        target_id: plugin.id,
      });
    },
    [cancelVote, logEvent, showLogin, upvote, user],
  );

  return { toggleUpvote };
};
