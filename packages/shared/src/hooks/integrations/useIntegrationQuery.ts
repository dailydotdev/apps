import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { UserIntegration } from '../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import { USER_INTEGRATION_BY_ID } from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';

export type UseIntegrationQueryProps = {
  id: string;
  queryOptions?: UseQueryOptions<UserIntegration[]>;
};

export type UseIntegrationQuery = UseQueryResult<UserIntegration>;

export const useIntegrationQuery = ({
  id,
  queryOptions,
}: UseIntegrationQueryProps = {}): UseIntegrationQuery => {
  const { user } = useAuthContext();
  const enabled = !!user;

  const queryResult = useQuery(
    generateQueryKey(RequestKey.UserIntegration, user),
    async () => {
      const result = await gqlClient.request<{
        userIntegration: UserIntegration;
      }>(USER_INTEGRATION_BY_ID, { id });

      return result.userIntegration;
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
