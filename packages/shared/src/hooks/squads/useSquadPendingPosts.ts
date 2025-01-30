import { useCallback, useMemo } from 'react';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { SourcePostModeration } from '../../graphql/squads';
import {
  SourcePostModerationStatus,
  SQUAD_PENDING_POSTS_QUERY,
  verifyPermission,
} from '../../graphql/squads';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import { SourcePermissions } from '../../graphql/sources';

type UseSquadPendingPosts = UseInfiniteQueryResult<
  InfiniteData<Connection<SourcePostModeration[]>>
> & {
  count: number;
  isModeratorInAnySquad: boolean;
};

export const useSquadPendingPosts = (
  squadId?: string,
  status: SourcePostModerationStatus[] = [SourcePostModerationStatus.Pending],
): UseSquadPendingPosts => {
  const { user, squads } = useAuthContext();
  const isModeratorInAnySquad = useMemo(() => {
    return squads?.some((squad) =>
      verifyPermission(squad, SourcePermissions.ModeratePost),
    );
  }, [squads]);

  const query = useInfiniteQuery<Connection<SourcePostModeration[]>>({
    queryKey: generateQueryKey(RequestKey.SquadPostRequests, user, squadId),
    queryFn: async ({ pageParam }) => {
      return gqlClient
        .request<{
          sourcePostModerations: Connection<SourcePostModeration[]>;
        }>(SQUAD_PENDING_POSTS_QUERY, {
          sourceId: squadId,
          status,
          after: pageParam,
        })
        .then((res) => res.sourcePostModerations);
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => getNextPageParam(lastPage?.pageInfo),
    enabled: Boolean(squadId) || isModeratorInAnySquad,

    select: useCallback((res) => {
      if (!res) {
        return undefined;
      }

      return {
        ...res,
        // filter out last page with no edges returned by api paginator
        pages: res.pages.filter((pageItem) => !!pageItem?.edges.length),
      };
    }, []),
  });

  return {
    ...query,
    count: query?.data?.pages.flatMap((page) => page.edges)?.length || 0,
    isModeratorInAnySquad,
  };
};
