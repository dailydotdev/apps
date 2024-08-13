import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToggle } from '../useToggle';
import { useActions } from '../useActions';
import {
  USER_STREAK_RECOVER_QUERY,
  UserStreakRecoverData,
  USER_STREAK_RECOVER_MUTATION,
} from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ActionType } from '../../graphql/actions';
import { gqlClient } from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';

interface UseStreakRecoverProps {
  onRequestClose: () => void;
}

interface UseStreakRecoverReturn {
  hideForever: {
    isChecked: boolean;
    toggle: () => void;
  };
  onClose?: () => void;
  onRecover?: () => void;
  recover: {
    canDo: boolean;
    cost: number;
    isLoading: boolean;
    isDisabled: boolean;
    oldStreakLength: number;
  };
}

export const useStreakRecover = ({
  onRequestClose,
}: UseStreakRecoverProps): UseStreakRecoverReturn => {
  const { completeAction, checkHasCompleted } = useActions();
  const [hideForever, toggleHideForever] = useToggle(false);
  const { displayToast } = useToastNotification();

  const { data, isLoading } = useQuery<{
    recoverStreak: UserStreakRecoverData;
  }>({
    queryKey: generateQueryKey(RequestKey.UserStreakRecover),
    queryFn: async () => {
      return await gqlClient.request(USER_STREAK_RECOVER_QUERY);
    },
  });

  const recoverMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.UserStreakRecover),
    mutationFn: async () => {
      return await gqlClient.request(USER_STREAK_RECOVER_MUTATION);
    },
    onSuccess: () => {
      displayToast('Lucky you! Your streak has been restored');
    },
  });

  const onClose = useCallback(async () => {
    if (hideForever) {
      await completeAction(ActionType.DisableReadingStreakRecover);
    }

    onRequestClose?.();
  }, [completeAction, hideForever, onRequestClose]);

  const onRecover = useCallback(async () => {
    await recoverMutation.mutateAsync();
    onRequestClose?.();
  }, [onRequestClose, recoverMutation]);

  return {
    hideForever: {
      isChecked: hideForever,
      toggle: toggleHideForever,
    },
    onClose,
    onRecover,
    recover: {
      ...data?.recoverStreak,
      isLoading,
      isDisabled: checkHasCompleted(ActionType.DisableReadingStreakRecover),
    },
  };
};

export default useStreakRecover;
