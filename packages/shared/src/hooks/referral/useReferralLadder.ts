import type { ReferralLadderStep } from '../../lib/referral';
import {
  getNextReferralLadderStep,
  ReferralCampaignKey,
  referralLadderSteps,
} from '../../lib/referral';
import { featureReferralLadder } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useReferralCampaign } from './useReferralCampaign';

interface UseReferralLadder {
  referredCount: number;
  nextStep?: ReferralLadderStep;
  remainingInvites: number;
  isCompleted: boolean;
  url: string;
  isReady: boolean;
}

const lastStep = referralLadderSteps[referralLadderSteps.length - 1];

export const useReferralLadder = (): UseReferralLadder => {
  const { referredUsersCount, url, isReady } = useReferralCampaign({
    campaignKey: ReferralCampaignKey.Generic,
  });
  const nextStep = getNextReferralLadderStep(referredUsersCount);

  return {
    referredCount: referredUsersCount,
    nextStep,
    remainingInvites: nextStep ? nextStep.invites - referredUsersCount : 0,
    isCompleted: referredUsersCount >= lastStep.invites,
    url,
    isReady,
  };
};

export const useReferralLadderFeature = (
  shouldEvaluate = true,
): { isEnabled: boolean; isLoading: boolean } => {
  const { value, isLoading } = useConditionalFeature({
    feature: featureReferralLadder,
    shouldEvaluate,
  });

  return { isEnabled: value, isLoading };
};
