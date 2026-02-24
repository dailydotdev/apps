import { useQuery } from '@tanstack/react-query';
import { getTopSquadsForTool } from '../../../graphql/user/userStack';
import type { ToolTopSquad } from '../../../graphql/user/userStack';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

const TOP_TOOL_SQUADS_LIMIT = 3;

interface UseToolTopSquadsProps {
  toolId?: string;
  enabled?: boolean;
}

const getToolIdOrThrow = (toolId?: string): string => {
  if (!toolId) {
    throw new Error('Tool id is required to fetch top squads');
  }

  return toolId;
};

export const useToolTopSquads = ({
  toolId,
  enabled = true,
}: UseToolTopSquadsProps) => {
  const query = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserTools,
      null,
      'top-squads-by-tool',
      toolId,
      TOP_TOOL_SQUADS_LIMIT,
    ),
    queryFn: () =>
      getTopSquadsForTool({
        toolId: getToolIdOrThrow(toolId),
        first: TOP_TOOL_SQUADS_LIMIT,
      }),
    staleTime: StaleTime.OneHour,
    enabled: enabled && !!toolId,
  });

  return {
    topSquads: query.data ?? ([] as ToolTopSquad[]),
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
  };
};
