import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToggle } from '../useToggle';
import { useActions } from '../useActions';
import {
  USER_STREAK_RECOVER_QUERY,
  UserStreakRecoverData,
} from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ActionType } from '../../graphql/actions';
import { gqlClient } from '../../graphql/common';

interface UseStreakRecoverProps {
  onRequestClose: () => void;
}

interface UseStreakRecoverReturn {
  hideForever: {
    isChecked: boolean;
    toggle: () => void;
  };
  onClose?: () => void;
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

  const { data, isLoading } = useQuery<{
    recoverStreak: UserStreakRecoverData;
  }>({
    queryKey: generateQueryKey(RequestKey.UserStreakRecover),
    queryFn: async () => {
      return await gqlClient.request(USER_STREAK_RECOVER_QUERY);
    },
  });
  const { amount, canDo, length } = data?.recoverStreak ?? {};

  const onClose = useCallback(async () => {
    if (hideForever) {
      await completeAction(ActionType.DisableReadingStreakRecover);
    }

    onRequestClose?.();
  }, [completeAction, hideForever, onRequestClose]);

  return {
    hideForever: {
      isChecked: hideForever,
      toggle: toggleHideForever,
    },
    onClose,
    recover: {
      cost: amount,
      canDo,
      oldStreakLength: length,
      isLoading,
      isDisabled: checkHasCompleted(ActionType.DisableReadingStreakRecover),
    },
  };
};

export default useStreakRecover;
