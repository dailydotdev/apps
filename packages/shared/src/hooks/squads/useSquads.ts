import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';
import { ClientError } from 'graphql-request';
import { Squad } from '../../graphql/sources';
import { getCurrentUserSquads } from '../../graphql/squads';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { graphqlUrl } from '../../lib/config';
import { useRequestProtocol } from '../useRequestProtocol';

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
  const { requestMethod } = useRequestProtocol();
  const queryKey = generateQueryKey(RequestKey.Squads, user);

  const {
    data: squads,
    isLoading,
    isFetched,
    error,
  } = useQuery<Squad[], ClientError>(
    queryKey,
    getCurrentUserSquads(requestMethod),
    {
      enabled: !!user?.id,
      retry: false,
      staleTime: StaleTime.Default,
    },
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
