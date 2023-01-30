import { useQueryClient } from 'react-query';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { Squad } from '../graphql/squads';
import { Boot } from '../lib/boot';
import sortBy from 'lodash.sortby';

type UseBoot = {
  addSquad: (squad: Squad) => void;
  deleteSquad: (squadId: string) => void;
  updateSquad: (squad: Squad) => void;
};

export const useBoot = (): UseBoot => {
  const client = useQueryClient();
  const getBootData = () => client.getQueryData<Boot>(BOOT_QUERY_KEY);
  const addSquad = (squad: Squad) => {
    const bootData = getBootData();
    const squads = sortBy([...(bootData.squads || []), squad], 'name');
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
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads: sortBy(squads ?? [], 'name') });
  };
  return {
    addSquad,
    deleteSquad,
    updateSquad,
  };
};
