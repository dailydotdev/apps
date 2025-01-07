import { useContext, useMemo } from 'react';
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { SquadEdgesData } from '../../graphql/squads';
import {
  collapsePinnedPosts,
  expandPinnedPosts,
  SQUAD_MEMBERS_QUERY,
  unblockSquadMember,
  updateSquadMemberRole,
} from '../../graphql/squads';
import type {
  SourceMember,
  SourceMemberRole,
  Squad,
} from '../../graphql/sources';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
} from '../../lib/query';
import { updateFlagsCache } from '../../graphql/source/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { gqlClient } from '../../graphql/common';

export interface UseSquadActions {
  onUnblock?: typeof unblockSquadMember;
  onUpdateRole?: typeof updateSquadMemberRole;
  collapseSquadPinnedPosts?: typeof collapsePinnedPosts;
  expandSquadPinnedPosts?: typeof expandPinnedPosts;
  membersQueryResult?: UseInfiniteQueryResult<InfiniteData<SquadEdgesData>>;
  members?: SourceMember[];
  membersQueryKey: unknown[];
}

interface MembersQueryParams {
  role?: SourceMemberRole;
}

interface UseSquadActionsProps {
  squad: Squad;
  query?: string;
  membersQueryParams?: MembersQueryParams;
  membersQueryEnabled?: boolean;
}

export const useSquadActions = ({
  squad,
  query,
  membersQueryParams = {},
  membersQueryEnabled,
}: UseSquadActionsProps): UseSquadActions => {
  const { queryKey: feedQueryKey } = useContext(ActiveFeedContext);
  const { user } = useAuthContext();
  const client = useQueryClient();
  const membersQueryKey = generateQueryKey(
    RequestKey.SquadMembers,
    null,
    membersQueryParams,
    squad?.id,
    query,
  );
  const { mutateAsync: onUpdateRole } = useMutation({
    mutationFn: updateSquadMemberRole,
    onSuccess: () => client.invalidateQueries({ queryKey: membersQueryKey }),
  });
  const { mutateAsync: onUnblock } = useMutation({
    mutationFn: unblockSquadMember,
    onSuccess: () => client.invalidateQueries({ queryKey: membersQueryKey }),
  });

  const { mutateAsync: collapseSquadPinnedPosts } = useMutation({
    mutationFn: collapsePinnedPosts,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: feedQueryKey });
      updateFlagsCache(client, squad, user, { collapsePinnedPosts: true });
    },
  });

  const { mutateAsync: expandSquadPinnedPosts } = useMutation({
    mutationFn: expandPinnedPosts,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: feedQueryKey });
      updateFlagsCache(client, squad, user, { collapsePinnedPosts: false });
    },
  });
  const membersQueryResult = useInfiniteQuery({
    queryKey: membersQueryKey,
    queryFn: ({ pageParam }) =>
      gqlClient.request<SquadEdgesData>(SQUAD_MEMBERS_QUERY, {
        id: squad?.id,
        after: typeof pageParam === 'string' ? pageParam : undefined,
        query,
        ...membersQueryParams,
      }),
    initialPageParam: '',
    enabled: !!squad?.id && membersQueryEnabled,
    getNextPageParam: ({ sourceMembers }) =>
      getNextPageParam(sourceMembers?.pageInfo),
  });

  return useMemo(
    () => ({
      onUnblock,
      onUpdateRole,
      collapseSquadPinnedPosts,
      expandSquadPinnedPosts,
      membersQueryResult,
      members:
        membersQueryResult.data?.pages
          .map((page) => page.sourceMembers.edges.map(({ node }) => node))
          .flat() ?? [],
      membersQueryKey,
    }),
    [
      onUnblock,
      onUpdateRole,
      collapseSquadPinnedPosts,
      expandSquadPinnedPosts,
      membersQueryResult,
      membersQueryKey,
    ],
  );
};
