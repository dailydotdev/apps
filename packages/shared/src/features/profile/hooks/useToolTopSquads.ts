import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Connection } from '../../../graphql/common';
import { getTopPublicSquadsByMembersCount } from '../../../graphql/user/userStack';
import type { TopPublicSquad } from '../../../graphql/user/userStack';
import { getSourceStack } from '../../../graphql/source/sourceStack';
import type { SourceStack } from '../../../graphql/source/sourceStack';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';

const TOP_PUBLIC_SQUADS_SCAN_LIMIT = 30;
const TOP_TOOL_SQUADS_LIMIT = 3;

export type ToolTopSquad = TopPublicSquad;

const toolExistsInSourceStack = (
  sourceStack: Connection<SourceStack>,
  toolId: string,
): boolean => {
  return sourceStack.edges.some(({ node }) => node.tool.id === toolId);
};

const resolveTopToolSquads = async ({
  toolId,
  squads,
  fetchSourceStack,
}: {
  toolId: string;
  squads: TopPublicSquad[];
  fetchSourceStack: (sourceId: string) => Promise<Connection<SourceStack>>;
}): Promise<ToolTopSquad[]> => {
  const sourceStacks = await Promise.all(
    squads.slice(0, TOP_PUBLIC_SQUADS_SCAN_LIMIT).map(async (squad) => {
      try {
        return {
          squad,
          sourceStack: await fetchSourceStack(squad.id),
        };
      } catch {
        return null;
      }
    }),
  );

  return sourceStacks.reduce<ToolTopSquad[]>((matches, stackWithSquad) => {
    if (!stackWithSquad || matches.length >= TOP_TOOL_SQUADS_LIMIT) {
      return matches;
    }

    if (!toolExistsInSourceStack(stackWithSquad.sourceStack, toolId)) {
      return matches;
    }

    matches.push(stackWithSquad.squad);
    return matches;
  }, []);
};

const getToolIdOrThrow = (toolId?: string): string => {
  if (!toolId) {
    throw new Error('Tool id is required to resolve top squads');
  }

  return toolId;
};

interface UseToolTopSquadsProps {
  toolId?: string;
  enabled?: boolean;
}

export const useToolTopSquads = ({
  toolId,
  enabled = true,
}: UseToolTopSquadsProps) => {
  const queryClient = useQueryClient();

  const topPublicSquadsQuery = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserTools,
      null,
      'top-public-squads',
      TOP_PUBLIC_SQUADS_SCAN_LIMIT,
    ),
    queryFn: () =>
      getTopPublicSquadsByMembersCount(TOP_PUBLIC_SQUADS_SCAN_LIMIT),
    staleTime: StaleTime.OneHour,
    enabled,
  });

  const topToolSquadsQuery = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserTools,
      null,
      'top-squads-by-tool',
      toolId,
    ),
    queryFn: () => {
      const resolvedToolId = getToolIdOrThrow(toolId);

      return resolveTopToolSquads({
        toolId: resolvedToolId,
        squads: topPublicSquadsQuery.data ?? [],
        fetchSourceStack: (sourceId) =>
          queryClient.fetchQuery({
            queryKey: generateQueryKey(RequestKey.SourceStack, null, sourceId),
            queryFn: () => getSourceStack(sourceId),
            staleTime: StaleTime.OneHour,
          }),
      });
    },
    staleTime: StaleTime.OneHour,
    enabled:
      enabled &&
      !!toolId &&
      !!topPublicSquadsQuery.data &&
      topPublicSquadsQuery.data.length > 0,
  });

  return {
    topSquads: topToolSquadsQuery.data ?? [],
    isPending:
      topPublicSquadsQuery.isPending ||
      (topPublicSquadsQuery.isSuccess && topToolSquadsQuery.isPending),
    isError: topPublicSquadsQuery.isError || topToolSquadsQuery.isError,
    error: topPublicSquadsQuery.error || topToolSquadsQuery.error,
  };
};
