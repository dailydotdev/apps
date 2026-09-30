import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import type {
  ReferralLadderFriend,
  ReferralLadderStep,
} from '../../graphql/users';
import { referralLadderQueryOptions } from '../../graphql/users';

interface UseReferralLadderProps {
  enabled?: boolean;
}

interface UseReferralLadder {
  // Only true once the ladder is loaded, so callers never render it early.
  isEligible: boolean;
  isLoading: boolean;
  referredCount: number;
  steps: ReferralLadderStep[];
  friends: ReferralLadderFriend[];
  nextStep?: ReferralLadderStep;
  remainingInvites: number;
  isCompleted: boolean;
}

const noSteps: ReferralLadderStep[] = [];
const noFriends: ReferralLadderFriend[] = [];

export const useReferralLadder = ({
  enabled = true,
}: UseReferralLadderProps = {}): UseReferralLadder => {
  const { user } = useAuthContext();
  const isQueryEnabled = enabled && !!user?.isReferralLadderEligible;
  const { data, isPending } = useQuery({
    ...referralLadderQueryOptions(user),
    enabled: isQueryEnabled,
  });
  const referredCount = data?.referredCount ?? 0;
  const steps = data?.steps ?? noSteps;
  const nextStep = steps.find(({ invites }) => invites > referredCount);

  return {
    isEligible: isQueryEnabled && !!data?.eligible,
    isLoading: isQueryEnabled && isPending,
    referredCount,
    steps,
    friends: data?.friends ?? noFriends,
    nextStep,
    remainingInvites: nextStep ? nextStep.invites - referredCount : 0,
    isCompleted: steps.length > 0 && !nextStep,
  };
};
