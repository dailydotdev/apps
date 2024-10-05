import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  SquadPostModerationProps,
  SquadPostRejectionProps,
  squadApproveMutation,
  squadRejectMutation,
} from '../../graphql/squads';

interface UseSquadPostModeration {
  onApprove: (
    props: Omit<SquadPostModerationProps, 'moderatedById'>,
  ) => Promise<void>;
  onReject: (
    props: Omit<SquadPostRejectionProps, 'moderatedById'>,
  ) => Promise<void>;
  isLoading: boolean;
  isSuccess: boolean;
}

export const useSquadPostModeration = (): UseSquadPostModeration => {
  const { user } = useAuthContext();
  const {
    mutateAsync: onApprove,
    isLoading: isLoadingApprove,
    isSuccess: isSuccessApprove,
  } = useMutation((props: Omit<SquadPostModerationProps, 'moderatedById'>) =>
    squadApproveMutation({ ...props, moderatedById: user.id }),
  );
  const {
    mutateAsync: onReject,
    isLoading: isLoadingReject,
    isSuccess: isSuccessReject,
  } = useMutation((props: Omit<SquadPostRejectionProps, 'moderatedById'>) =>
    squadRejectMutation({ ...props, moderatedById: user.id }),
  );

  return {
    isSuccess: isSuccessApprove || isSuccessReject,
    isLoading: isLoadingApprove || isLoadingReject,
    onApprove,
    onReject,
  };
};
