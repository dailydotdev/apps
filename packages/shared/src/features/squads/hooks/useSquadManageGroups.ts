import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureStartupsCheckout } from '../../../lib/featureManagement';
import { useSquadPageContext } from '../SquadPageContext';
import type { SquadManageGroup } from '../lib/manage';
import { getSquadManageGroups } from '../lib/manage';
import { isStaffViewer } from '../lib/viewer';

interface UseSquadManageGroups {
  groups: SquadManageGroup[];
  /** The flag behind the Plan section is still loading. */
  isLoading: boolean;
}

export const useSquadManageGroups = (): UseSquadManageGroups => {
  const { squad, viewer } = useSquadPageContext();
  const isStaff = isStaffViewer(viewer);
  const { value: isPlanEnabled, isLoading } = useConditionalFeature({
    feature: featureStartupsCheckout,
    shouldEvaluate: isStaff,
  });

  return {
    groups: getSquadManageGroups(squad, viewer, { isPlanEnabled }),
    isLoading: isStaff && isLoading,
  };
};
