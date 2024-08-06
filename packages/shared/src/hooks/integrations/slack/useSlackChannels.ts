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

export type UseSlackChannelsProps = {
  integrationId: string;
  queryOptions?: UseQueryOptions<SlackChannel[]>;
};

export type UseSlackChannels = UseQueryResult<SlackChannel[]>;

export const useSlackChannels = ({
  integrationId,
  queryOptions,
}: UseSlackChannelsProps): UseSlackChannels => {
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
      enabled: queryOptions?.enabled
        ? queryOptions.enabled && enabled
        : enabled,
    },
  );

  return queryResult;
};
