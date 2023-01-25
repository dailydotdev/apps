import { useQueryClient } from 'react-query';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { Squad, squadMemberships } from '../graphql/squads';
import { Boot } from '../lib/boot';

type UseBoot = {
  addSquad: (squad: Squad) => void;
  deleteSquad: (squadId: string) => void;
  updateSquads: () => Promise<void>;
  updateSquad: (squad: Squad) => void;
};

export const useBoot = (): UseBoot => {
  const client = useQueryClient();
  const getBootData = () => client.getQueryData<Boot>(BOOT_QUERY_KEY);
  const addSquad = (squad: Squad) => {
    const bootData = getBootData();
    const squads = [...(bootData.squads || []), squad];
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };
  const deleteSquad = (squadId: string) => {
    const bootData = getBootData();
    const squads = bootData.squads?.filter((squad) => squad.id !== squadId);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };
  const updateSquad = (squad: Squad) => {
    const bootData = getBootData();
    const squads = bootData.squads?.map((bootSquad) =>
      squad.id !== bootSquad.id ? bootSquad : squad,
    );
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };
  const updateSquads = async () => {
    const squads = await squadMemberships();
    const bootData = client.getQueryData<Boot>(BOOT_QUERY_KEY);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };
  return {
    addSquad,
    deleteSquad,
    updateSquads,
    updateSquad,
  };
};
