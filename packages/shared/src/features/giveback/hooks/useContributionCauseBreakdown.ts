import { useContributionOverview } from './useContributionOverview';
import type { ContributionCauseCategoryBreakdown } from '../types';

interface UseContributionCauseBreakdown {
  breakdown: ContributionCauseCategoryBreakdown[];
  isPending: boolean;
}

// The projected pool split across cause categories, powering the causes
// breakdown donut. Public campaign data, so it rides the shared overview query
// (see `useContributionOverview`) rather than firing its own request.
export const useContributionCauseBreakdown =
  (): UseContributionCauseBreakdown => {
    const { data, isPending } = useContributionOverview();

    return {
      breakdown: data?.contributionCauseBreakdown ?? [],
      isPending,
    };
  };
