import { useQueryClient } from 'react-query';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { Squad } from '../graphql/squads';
import { Boot } from '../lib/boot';

type UseBoot = {
  addSquad: (squad: Squad) => void;
  deleteSquad: (squadId: string) => void;
  updateSquad: (squad: Squad) => void;
};

const sortByName = (squads: Squad[]): Squad[] =>
  [...squads].sort((a, b) =>
    a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase() ? 1 : -1,
  );

export const useBoot = (): UseBoot => {
  const client = useQueryClient();
  const getBootData = () => client.getQueryData<Boot>(BOOT_QUERY_KEY);
  const addSquad = (squad: Squad) => {
    const bootData = getBootData();
    const squads = sortByName([...(bootData.squads || []), squad]);
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
    client.setQueryData<Boot>(BOOT_QUERY_KEY, {
      ...bootData,
      squads: sortByName(squads ?? []),
    });
  };
  return {
    addSquad,
    deleteSquad,
    updateSquad,
  };
};
