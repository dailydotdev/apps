import type { QueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import type { AwardProps, FeaturedAward } from '../graphql/njord';
import { getProductsQueryOptions } from '../graphql/njord';
import type { Plugin } from '../graphql/plugins';
import { generateQueryKey, RequestKey } from '../lib/query';
import { useMutationSubscription } from './mutationSubscription/useMutationSubscription';
import { useUpdateQuery } from './useUpdateQuery';

const applyPluginAward = (plugin: Plugin, award: FeaturedAward): Plugin => {
  const featuredValue = plugin.featuredAward?.award?.value;

  return {
    ...plugin,
    awarded: true,
    numAwards: (plugin.numAwards || 0) + 1,
    featuredAward:
      !featuredValue || award.value > featuredValue
        ? { award }
        : plugin.featuredAward,
  };
};

const updateCachedPluginAward = (
  client: QueryClient,
  id: string,
  award: FeaturedAward,
): void => {
  const update = (plugin: Plugin): Plugin =>
    plugin.id === id ? applyPluginAward(plugin, award) : plugin;

  client.setQueriesData<Plugin[]>(
    { queryKey: [RequestKey.Plugins] },
    (plugins) => plugins?.map(update),
  );
  client.setQueriesData<Plugin>({ queryKey: [RequestKey.Plugin] }, (plugin) =>
    plugin ? update(plugin) : plugin,
  );
};

export const usePluginAwardSubscription = (pluginId: string): void => {
  const { user } = useAuthContext();
  const [getProducts] = useUpdateQuery(getProductsQueryOptions());

  useMutationSubscription<AwardProps>({
    matcher: ({ mutation, variables }) => {
      const [requestKey] = Array.isArray(mutation.options.mutationKey)
        ? mutation.options.mutationKey
        : [];

      return (
        requestKey === 'awards' &&
        variables?.type === 'PLUGIN' &&
        variables.entityId === pluginId
      );
    },
    callback: ({ variables, queryClient }) => {
      if (!variables) {
        return;
      }

      const { entityId, type, productId } = variables;

      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Products, undefined, 'summary'),
      });
      queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Awards, undefined, {
          id: entityId,
          type,
        }),
        exact: false,
      });

      const award = getProducts()?.edges.find(
        ({ node }) => node.id === productId,
      )?.node;

      if (award) {
        updateCachedPluginAward(queryClient, entityId, award);
      }
    },
  });
};
