import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Prompt } from '../../graphql/prompt';
import { PROMPTS_QUERY } from '../../graphql/prompt';

type UsePromptsQueryProps = {
  queryOptions?: Partial<UseQueryOptions<Prompt[]>>;
};

type UsePromptsQuery = UseQueryResult<Prompt[]>;

export const usePromptsQuery = ({
  queryOptions,
}: UsePromptsQueryProps = {}): UsePromptsQuery => {
  const { user } = useAuthContext();
  const enabled = !!user;

  const queryResult = useQuery({
    queryKey: generateQueryKey(RequestKey.Prompts, user),

    queryFn: async () => {
      const result = await gqlClient.request<{
        prompts: Prompt[];
      }>(PROMPTS_QUERY);

      return result.prompts;
    },
    staleTime: StaleTime.OneHour,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
  });

  return queryResult;
};
