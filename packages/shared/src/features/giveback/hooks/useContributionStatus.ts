import { useContributionOverview } from './useContributionOverview';
import type { ContributionStatus } from '../types';

interface UseContributionStatus {
  status?: ContributionStatus;
  isPending: boolean;
}

// Campaign-wide numbers come back for everyone, while the user-specific fields
// (`eligible`, `userPoints`) are null until the visitor signs in. Backed by the
// shared overview query (see `useContributionOverview`).
export const useContributionStatus = (): UseContributionStatus => {
  const { data, isPending } = useContributionOverview();

  return { status: data?.contributionStatus, isPending };
};
