import { useQueryClient } from 'react-query';
import { BOOT_QUERY_KEY } from '../contexts/common';
import { squadMemberships } from '../graphql/squads';
import { Boot } from '../lib/boot';

type UseBoot = {
  updateSquads: () => Promise<void>;
};

export const useBoot = (): UseBoot => {
  const client = useQueryClient();
  const updateSquads = async () => {
    const squads = await squadMemberships();
    const bootData = client.getQueryData<Boot>(BOOT_QUERY_KEY);
    client.setQueryData<Boot>(BOOT_QUERY_KEY, { ...bootData, squads });
  };
  return {
    updateSquads,
  };
};
