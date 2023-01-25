import { useQueryClient } from 'react-query';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { squadMemberships } from '../graphql/squads';
import { Boot } from '../lib/boot';

type UseBoot = {
  deleteSquad: (squadId: string) => void;
  updateSquads: () => Promise<void>;
};

export const useBoot = (): UseBoot => {
  const client = useQueryClient();
  const deleteSquad = (squadId: string) => {
    const bootData = client.getQueryData<Boot>(BOOT_QUERY_KEY);
    const squads = bootData.squads?.filter(squad => squad.id !== squadId);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  }
  const updateSquads = async () => {
    const squads = await squadMemberships();
    const bootData = client.getQueryData<Boot>(BOOT_QUERY_KEY);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };
  return {
    deleteSquad,
    updateSquads,
  };
};
