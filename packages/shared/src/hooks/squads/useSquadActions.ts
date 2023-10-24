import { useMemo } from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQueryClient,
} from 'react-query';
import request from 'graphql-request';
import {
  SQUAD_MEMBERS_QUERY,
  SquadEdgesData,
  unblockSquadMember,
  updateSquadMemberRole,
} from '../../graphql/squads';
import { graphqlUrl } from '../../lib/config';
import { SourceMember, SourceMemberRole, Squad } from '../../graphql/sources';
import { generateQueryKey, RequestKey } from '../../lib/query';

export interface UseSquadActions {
  onUnblock?: typeof unblockSquadMember;
  onUpdateRole?: typeof updateSquadMemberRole;
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

  const membersQueryResult = useInfiniteQuery<SquadEdgesData>(
    membersQueryKey,
    ({ pageParam }) =>
      request(graphqlUrl, SQUAD_MEMBERS_QUERY, {
        id: squad?.id,
        after: typeof pageParam === pageParam ? pageParam : null,
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
      membersQueryResult,
      members:
        membersQueryResult.data?.pages
          .map((page) => page.sourceMembers.edges.map(({ node }) => node))
          .flat() ?? [],
    }),
    [onUnblock, onUpdateRole, membersQueryResult],
  );
};
