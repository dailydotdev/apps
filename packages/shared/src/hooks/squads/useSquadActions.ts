import { useContext, useMemo } from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  collapsePinnedPosts,
  expandPinnedPosts,
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
  unblockSquadMember,
  updateSquadMemberRole,
} from '../../graphql/squads';
import { SourceMember, SourceMemberRole, Squad } from '../../graphql/sources';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { updateFlagsCache } from '../../graphql/source/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { ActiveFeedContext } from '../../contexts/ActiveFeedContext';
import { gqlClient } from '../../graphql/common';

export interface UseSquadActions {
  onUnblock?: typeof unblockSquadMember;
  onUpdateRole?: typeof updateSquadMemberRole;
  collapseSquadPinnedPosts?: typeof collapsePinnedPosts;
  expandSquadPinnedPosts?: typeof expandPinnedPosts;
  membersQueryResult?: UseInfiniteQueryResult<SquadEdgesData>;
  members?: SourceMember[];
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
  const { mutateAsync: onUpdateRole } = useMutation(updateSquadMemberRole, {
    onSuccess: () => client.invalidateQueries(membersQueryKey),
  });
  const { mutateAsync: onUnblock } = useMutation(unblockSquadMember, {
    onSuccess: () => client.invalidateQueries(membersQueryKey),
  });

  const { mutateAsync: collapseSquadPinnedPosts } = useMutation(
    collapsePinnedPosts,
    {
      onSuccess: () => {
        client.invalidateQueries(feedQueryKey);
        updateFlagsCache(client, squad, user, { collapsePinnedPosts: true });
      },
    },
  );

  const { mutateAsync: expandSquadPinnedPosts } = useMutation(
    expandPinnedPosts,
    {
      onSuccess: () => {
        client.invalidateQueries(feedQueryKey);
        updateFlagsCache(client, squad, user, { collapsePinnedPosts: false });
      },
    },
  );
  const membersQueryResult = useInfiniteQuery<SquadEdgesData>(
    membersQueryKey,
    ({ pageParam }) =>
      gqlClient.request(SQUAD_MEMBERS_QUERY, {
        id: squad?.id,
        after: typeof pageParam === 'string' ? pageParam : undefined,
        query,
        ...membersQueryParams,
      }),
    {
      enabled: !!squad?.id && membersQueryEnabled,
      getNextPageParam: (lastPage) =>
        lastPage?.sourceMembers?.pageInfo?.hasNextPage &&
        lastPage?.sourceMembers?.pageInfo?.endCursor,
    },
  );

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
    }),
    [
      onUnblock,
      onUpdateRole,
      collapseSquadPinnedPosts,
      expandSquadPinnedPosts,
      membersQueryResult,
    ],
  );
};
