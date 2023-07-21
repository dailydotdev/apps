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
  membersQueryParams?: MembersQueryParams;
  membersQueryEnabled?: boolean;
}

export const useSquadActions = ({
  squad,
  membersQueryParams = {},
  membersQueryEnabled,
}: UseSquadActionsProps): UseSquadActions => {
  const client = useQueryClient();
  const membersQueryKey = ['squadMembers', squad?.id, membersQueryParams];
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
        after: pageParam,
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
