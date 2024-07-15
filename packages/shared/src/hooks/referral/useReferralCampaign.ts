import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { useRequestProtocol } from '../useRequestProtocol';
import { REFERRAL_CAMPAIGN_QUERY } from '../../graphql/users';
import { RequestKey, generateQueryKey, STALE_TIME } from '../../lib/query';
import AuthContext from '../../contexts/AuthContext';
import { Feature } from '../../lib/featureManagement';
import { useFeatureIsOn } from '../../components/GrowthBookProvider';
import { isTesting } from '../../lib/constants';
import { ReferralCampaignKey } from '../../lib';

export { ReferralCampaignKey };

export interface ReferralCampaign {
  referredUsersCount: number;
  referralCountLimit: number;
  referralToken: string;
  url: string;
}

export interface UseReferralCampaign extends ReferralCampaign {
  isCompleted: boolean;
  isReady: boolean;
  availableCount: number;
  noKeysAvailable: boolean;
}

export type UseReferralCampaignProps = {
  campaignKey: ReferralCampaignKey;
  enabled?: boolean;
};

const campaignFeatureFlagMap: Partial<
  Record<ReferralCampaignKey, Feature<string>>
> = {};

const useReferralCampaign = ({
  campaignKey,
  enabled = true,
}: UseReferralCampaignProps): UseReferralCampaign => {
  const isValidCampaignKey =
    Object.values(ReferralCampaignKey).includes(campaignKey);
  const featureFlag = campaignFeatureFlagMap[campaignKey];
  const isCampaignEnabled =
    (useFeatureIsOn(featureFlag) || (!featureFlag && isValidCampaignKey)) &&
    enabled;
  const { requestMethod } = useRequestProtocol();
  const { user } = useContext(AuthContext);
  const queryKey = generateQueryKey(RequestKey.ReferralCampaigns, user, {
    referralOrigin: campaignKey,
  });
  const { data, isSuccess, fetchStatus } = useQuery(
    queryKey,
    async () => {
      const result = await requestMethod<{
        referralCampaign: ReferralCampaign;
      }>(
        REFERRAL_CAMPAIGN_QUERY,
        { referralOrigin: campaignKey },
        { requestKey: JSON.stringify(queryKey) },
      );

      return result.referralCampaign;
    },
    {
      enabled: !!user?.id && !!isCampaignEnabled,
      staleTime: STALE_TIME,
    },
  );
  const {
    referralCountLimit = 0,
    referredUsersCount = 0,
    referralToken,
    url,
  } = data ?? {};
  const referralCurrentCount =
    referredUsersCount > referralCountLimit
      ? referralCountLimit
      : referredUsersCount;

  return {
    referredUsersCount,
    referralCountLimit,
    url,
    referralToken,
    isReady: isSuccess || fetchStatus === 'idle' || isTesting,
    isCompleted: referralCurrentCount >= referralCountLimit,
    availableCount: referralCountLimit - referredUsersCount,
    noKeysAvailable: referralCountLimit - referredUsersCount <= 0,
  };
};

export { useReferralCampaign };
