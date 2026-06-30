import { useQuery } from '@tanstack/react-query';
import { getCampaignById } from '../graphql/campaigns';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { useAuthContext } from '../contexts/AuthContext';

export const useCampaignByIdOptions = (campaignId: string) => {
  const { user } = useAuthContext();

  return {
    queryKey: generateQueryKey(RequestKey.Campaigns, user, campaignId),
    queryFn: () => getCampaignById(campaignId),
    staleTime: StaleTime.Default,
    enabled: !!campaignId,
  };
};

export const useCampaignById = (campaignId: string) =>
  useQuery(useCampaignByIdOptions(campaignId));
