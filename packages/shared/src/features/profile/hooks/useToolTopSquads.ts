import { useMemo } from 'react';
import type { Squad } from '../../../graphql/sources';
import {
  getFlatteredSources,
  useSources,
} from '../../../hooks/source/useSources';

const TOP_TOOL_SQUADS_LIMIT = 3;

export type ToolTopSquad = Pick<
  Squad,
  'id' | 'name' | 'handle' | 'image' | 'membersCount'
>;

interface UseToolTopSquadsProps {
  toolId?: string;
  enabled?: boolean;
}

export const useToolTopSquads = ({
  toolId,
  enabled = true,
}: UseToolTopSquadsProps) => {
  const {
    result: { data, isPending, isError, error },
  } = useSources<Squad>({
    query: {
      first: TOP_TOOL_SQUADS_LIMIT,
      isPublic: true,
      sortByMembersCount: true,
      toolId,
    },
    isEnabled: enabled && !!toolId,
  });

  const topSquads = useMemo(
    () =>
      (getFlatteredSources({ data }) as Squad[])
        .slice(0, TOP_TOOL_SQUADS_LIMIT)
        .map((squad) => ({
          id: squad.id,
          name: squad.name,
          handle: squad.handle,
          image: squad.image,
          membersCount: squad.membersCount,
        })),
    [data],
  );

  return {
    topSquads,
    isPending,
    isError,
    error,
  };
};
