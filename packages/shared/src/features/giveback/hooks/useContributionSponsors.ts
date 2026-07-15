import { useContributionOverview } from './useContributionOverview';
import type { ContributionSponsor } from '../types';

interface UseContributionSponsors {
  sponsors: ContributionSponsor[];
  isPending: boolean;
}

// The sponsor wall is campaign social proof and renders for everyone. Backed by
// the shared overview query (see `useContributionOverview`).
export const useContributionSponsors = (): UseContributionSponsors => {
  const { data, isPending } = useContributionOverview();

  return {
    sponsors: data?.contributionSponsors?.edges.map((edge) => edge.node) ?? [],
    isPending,
  };
};
