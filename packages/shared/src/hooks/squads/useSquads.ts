import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { useMemo } from 'react';
import { MySourcesData, Squad } from '../../graphql/sources';
import { getCurrentUserSquads } from '../../graphql/squads';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useRequestProtocol } from '../useRequestProtocol';
import { useBackgroundRequest } from '../companion';

interface UseSquadsResult {
  squads: Squad[];
  isLoading: boolean;
  isFetched: boolean;
  error: ClientError | null;
  addSquad: (squad: Squad) => Promise<void>;
  updateSquad: (squad: Squad) => Promise<void>;
  deleteSquad: (squadId: string) => Promise<void>;
}

const sortByName = (squads: Squad[]): Squad[] =>
  [...squads].sort((a, b) =>
    a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1,
  );

const getCached = async (
  client: ReturnType<typeof useQueryClient>,
  queryKey: QueryKey,
): Promise<Squad[]> => {
  return (await client.getQueryData<Squad[]>(queryKey)) || [];
};

export const useSquads = (): UseSquadsResult => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { requestMethod, isCompanion } = useRequestProtocol();
  const queryKey = generateQueryKey(RequestKey.Squads, user);
  useBackgroundRequest(queryKey, { enabled: isCompanion });

  const { data, isLoading, isFetched, error } = useQuery<
    MySourcesData,
    ClientError
  >(
    queryKey,
    getCurrentUserSquads(requestMethod, isCompanion ? queryKey : undefined),
    {
      enabled: !!user?.id,
      staleTime: StaleTime.Default,
    },
  );

  const squads: Squad[] = useMemo(
    () =>
      data?.mySourceMemberships?.edges
        ?.map((edge) => edge.node.source)
        ?.sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()),
        ) ?? [],
    [data],
  );

  const addSquad = async (squad: Squad) => {
    const currentSquads = await getCached(client, queryKey);

    const squadExists = currentSquads.some((item) => item.id === squad.id);

    if (squadExists) {
      return;
    }

    const newSquads = sortByName([...currentSquads, squad]);
    client.setQueryData<Squad[]>(queryKey, newSquads);
  };

  const deleteSquad = async (squadId: string) => {
    const currentSquads = await getCached(client, queryKey);
    const newSquads = currentSquads.filter((squad) => squad.id !== squadId);
    client.setQueryData<Squad[]>(queryKey, newSquads);
  };

  const updateSquad = async (squad: Squad) => {
    const currentSquads = await getCached(client, queryKey);
    const newSquads = currentSquads?.map((cachedSquad) =>
      squad.id !== cachedSquad.id ? cachedSquad : squad,
    );
    client.setQueryData<Squad[]>(queryKey, newSquads);
  };

  return {
    squads,
    isLoading,
    isFetched,
    error,
    addSquad,
    updateSquad,
    deleteSquad,
  };
};
