import { useSquadPageContext } from '../SquadPageContext';
import type { SquadManageGroup } from '../lib/manage';
import { getSquadManageGroups } from '../lib/manage';

export const useSquadManageGroups = (): SquadManageGroup[] => {
  const { squad, viewer } = useSquadPageContext();

  return getSquadManageGroups(squad, viewer);
};
