import { useQuery } from '@tanstack/react-query';
import user from '../../../__tests__/fixture/loggedUser';
import type { StartCampaignProps, CampaignType } from '../../graphql/campaigns';
import { getDailyCampaignReachEstimate } from '../../graphql/campaigns';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

interface UseCampaignEstimationProps {
  type: CampaignType;
  query: Omit<StartCampaignProps, 'value' | 'type'>;
  enabled?: boolean;
  referenceId: string;
}

const placeholderData = { min: 0, max: 0 };

export const useCampaignEstimation = ({
  type,
  query,
  enabled = true,
  referenceId,
}: UseCampaignEstimationProps) => {
  const queryKey = generateQueryKey(
    RequestKey.PostCampaigns,
    user,
    'estimate',
    referenceId,
    type,
    query,
  );

  const {
    data: estimatedReach,
    isPending,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getDailyCampaignReachEstimate({
        type,
        value: referenceId,
        budget: query.budget,
        duration: query.duration,
      }),
    enabled,
    placeholderData,
    staleTime: StaleTime.Default,
  });

  return { estimatedReach, isLoading: isPending || isRefetching };
};
