import { UseQueryResult, useQuery } from 'react-query';
import { useContext } from 'react';
import { useRequestProtocol } from './useRequestProtocol';
import { REFERRAL_CAMPAIGN_QUERY, ReferralOriginKey } from '../graphql/users';
import { graphqlUrl } from '../lib/config';
import { RequestKey, generateQueryKey } from '../lib/query';
import AuthContext from '../contexts/AuthContext';

export type UseReferralCampaign = Pick<ReferralCampaign, 'referredUsersCount'> &
  Pick<UseQueryResult<ReferralCampaign>, 'isLoading'>;

export type UseReferralCampaignProps = {
  referralOrigin: ReferralOriginKey;
};

export type ReferralCampaign = {
  referredUsersCount: number;
};

const useReferralCampaign = ({
  referralOrigin,
}: UseReferralCampaignProps): UseReferralCampaign => {
  const { requestMethod } = useRequestProtocol();
  const { user } = useContext(AuthContext);
  const queryKey = generateQueryKey(RequestKey.ReferralCampaigns, user, {
    referralOrigin,
  });
  const { data, isLoading } = useQuery(
    queryKey,
    async () => {
      const result = await requestMethod<{
        referralCampaign: ReferralCampaign;
      }>(
        graphqlUrl,
        REFERRAL_CAMPAIGN_QUERY,
        { referralOrigin },
        { requestKey: JSON.stringify(queryKey) },
      );

      return result.referralCampaign;
    },
    {
      enabled: !!user?.id,
      initialData: () => ({
        referredUsersCount: 0,
      }),
    },
  );

  return {
    referredUsersCount: data.referredUsersCount,
    isLoading,
  };
};

export { useReferralCampaign };
