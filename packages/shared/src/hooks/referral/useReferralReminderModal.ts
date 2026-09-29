import { useAuthContext } from '../../contexts/AuthContext';
import { LazyModal } from '../../components/modals/common/types';
import { useReferralLadder } from './useReferralLadder';

type ReferralReminderModal =
  | LazyModal.ReferralLadderPromo
  | LazyModal.GenericReferral;

interface UseReferralReminderModalProps {
  enabled: boolean;
}

// Waits for the ladder so eligible users never see the generic popup first.
export const useReferralReminderModal = ({
  enabled,
}: UseReferralReminderModalProps): ReferralReminderModal | undefined => {
  const { user } = useAuthContext();
  const { isLoading, isEligible, isCompleted } = useReferralLadder({
    enabled,
  });

  if (!enabled || !user || isLoading) {
    return undefined;
  }

  return isEligible && !isCompleted
    ? LazyModal.ReferralLadderPromo
    : LazyModal.GenericReferral;
};
