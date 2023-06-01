import { useQuery } from 'react-query';
import { useContext } from 'react';
import { useRequestProtocol } from './useRequestProtocol';
import { REFERRAL_CAMPAIGN_QUERY } from '../graphql/users';
import { graphqlUrl } from '../lib/config';
import { RequestKey, generateQueryKey } from '../lib/query';
import AuthContext from '../contexts/AuthContext';

export type ReferralCampaign = {
  referredUsersCount: number;
  url: string;
};

export type UseReferralCampaign = Pick<
  ReferralCampaign,
  'referredUsersCount'
> & {
  url: string;
  referralCurrentCount: number;
  referralTargetCount: number;
  isCompleted: boolean;
  isReady: boolean;
};

export enum ReferralCampaignKey {
  LegoMay2023 = 'lego-0523',
}

export type UseReferralCampaignProps = {
  campaignKey: ReferralCampaignKey;
};

export const campaignToReferralTargetCountMap: Record<
  ReferralCampaignKey,
  number
> = {
  [ReferralCampaignKey.LegoMay2023]: 5,
};

const useReferralCampaign = ({
  campaignKey,
}: UseReferralCampaignProps): UseReferralCampaign => {
  const { requestMethod } = useRequestProtocol();
  const { user } = useContext(AuthContext);
  const queryKey = generateQueryKey(RequestKey.ReferralCampaigns, user, {
    referralOrigin: campaignKey,
  });
  const referralTargetCount = campaignToReferralTargetCountMap[campaignKey];
  const { data, isSuccess } = useQuery(
    queryKey,
    async () => {
      const result = await requestMethod<{
        referralCampaign: ReferralCampaign;
      }>(
        graphqlUrl,
        REFERRAL_CAMPAIGN_QUERY,
        { referralOrigin: campaignKey },
        { requestKey: JSON.stringify(queryKey) },
      );

      return result.referralCampaign;
    },
    {
      enabled: !!user?.id,
    },
  );
  const referredUsersCount = data?.referredUsersCount || 0;
  const referralCurrentCount =
    referredUsersCount > referralTargetCount
      ? referralTargetCount
      : referredUsersCount;

  return {
    referredUsersCount,
    url: data?.url,
    isReady: isSuccess,
    referralCurrentCount,
    referralTargetCount,
    isCompleted: referralCurrentCount === referralTargetCount,
  };
};

export { useReferralCampaign };
