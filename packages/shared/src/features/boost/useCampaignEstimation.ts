import { useQuery } from '@tanstack/react-query';
import type { StartCampaignProps, CampaignType } from '../../graphql/campaigns';
import { getDailyCampaignReachEstimate } from '../../graphql/campaigns';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseCampaignEstimationProps {
  type: CampaignType;
  query: Omit<StartCampaignProps, 'value' | 'type' | 'duration'>;
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
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(
    RequestKey.Campaigns,
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
    isFetched,
  } = useQuery({
    queryKey,
    queryFn: () =>
      getDailyCampaignReachEstimate({
        type,
        value: referenceId,
        budget: query.budget,
      }),
    enabled,
    placeholderData,
    staleTime: StaleTime.Default,
  });

  return {
    estimatedReach: estimatedReach ?? placeholderData,
    isLoading: isPending || isRefetching,
    isFetched,
  };
};
