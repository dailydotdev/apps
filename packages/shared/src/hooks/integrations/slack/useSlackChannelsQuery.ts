import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  SLACK_CHANNELS_QUERY,
  SlackChannel,
} from '../../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';

export type UseSlackChannelsQueryProps = {
  integrationId: string;
  queryOptions?: UseQueryOptions<SlackChannel[]>;
};

export type UseSlackChannelsQuery = UseQueryResult<SlackChannel[]>;

export const useSlackChannelsQuery = ({
  integrationId,
  queryOptions,
}: UseSlackChannelsQueryProps): UseSlackChannelsQuery => {
  const { user } = useAuthContext();
  const enabled = !!integrationId;

  const queryResult = useQuery(
    generateQueryKey(RequestKey.SlackChannels, user, {
      integrationId,
    }),
    async ({ queryKey }) => {
      const [, , queryVariables] = queryKey as [
        unknown,
        unknown,
        { integrationId: string },
      ];
      const result = await gqlClient.request<{
        slackChannels: {
          data: SlackChannel[];
        };
      }>(SLACK_CHANNELS_QUERY, queryVariables);

      return result.slackChannels.data.sort((a, b) => {
        if (a.name < b.name) {
          return -1;
        }

        if (a.name > b.name) {
          return 1;
        }

        return 0;
      });
    },
    {
      staleTime: StaleTime.Default,
      ...queryOptions,
      enabled:
        typeof queryOptions?.enabled !== 'undefined'
          ? queryOptions.enabled && enabled
          : enabled,
    },
  );

  return queryResult;
};
