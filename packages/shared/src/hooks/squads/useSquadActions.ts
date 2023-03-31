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
  updateSquadMemberRole,
} from '../../graphql/squads';
import { graphqlUrl } from '../../lib/config';
import { SourceMember, Squad } from '../../graphql/sources';

interface UseSquadActions {
  onUpdateRole?: typeof updateSquadMemberRole;
  membersQueryResult?: UseInfiniteQueryResult<SquadEdgesData>;
  members?: SourceMember[];
}

interface UseSquadActionsProps {
  squad: Squad;
  membersQueryEnabled?: boolean;
}

export const useSquadActions = ({
  squad,
  membersQueryEnabled,
}: UseSquadActionsProps): UseSquadActions => {
  const client = useQueryClient();
  const { mutateAsync: onUpdateRole } = useMutation(updateSquadMemberRole, {
    onSuccess: (_, { sourceId }) =>
      client.invalidateQueries(['squadMembers', sourceId]),
  });

  const membersQueryKey = ['squadMembers', squad?.id];
  const membersQueryResult = useInfiniteQuery<SquadEdgesData>(
    membersQueryKey,
    ({ pageParam }) =>
      request(graphqlUrl, SQUAD_MEMBERS_QUERY, {
        id: squad?.id,
        after: pageParam,
      }),
    {
      enabled: !!squad?.id && membersQueryEnabled,
      getNextPageParam: (lastPage) =>
        lastPage?.sourceMembers?.pageInfo?.hasNextPage &&
        lastPage?.sourceMembers?.pageInfo?.endCursor,
    },
  );

  const members = useMemo(
    () =>
      membersQueryResult.data?.pages
        .map((page) =>
          page.sourceMembers.edges.map(({ node }) => ({ ...node, page })),
        )
        .flat() ?? [],
    [membersQueryResult],
  );

  return useMemo(
    () => ({ onUpdateRole, membersQueryResult, members }),
    [onUpdateRole, membersQueryResult, squad, membersQueryEnabled],
  );
};
