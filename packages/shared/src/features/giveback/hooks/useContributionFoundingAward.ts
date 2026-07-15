import { useContributionActions } from './useContributionActions';
import type { ContributionFoundingAward } from '../types';

interface UseContributionFoundingAward {
  foundingAward?: ContributionFoundingAward;
  isPending: boolean;
}

// Thin facade over the combined journey query (see `useContributionActions`),
// which fetches the founding-award state alongside the actions and reward tiers
// in one request. Sharing the query key means the roadmap reuses the cached
// result instead of firing a second request.
export const useContributionFoundingAward = (
  enabled: boolean,
): UseContributionFoundingAward => {
  const { foundingAward, isPending } = useContributionActions(enabled);

  return { foundingAward, isPending };
};
