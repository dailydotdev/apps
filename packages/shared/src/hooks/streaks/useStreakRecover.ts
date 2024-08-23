import { useCallback, useEffect } from 'react';
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
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';

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
    canRecover: boolean;
    cost: number;
    isLoading: boolean;
    isDisabled: boolean;
    oldStreakLength: number;
  };
}

export const useStreakRecover = ({
  onRequestClose,
}: UseStreakRecoverProps): UseStreakRecoverReturn => {
  const { isActionsFetched, completeAction, checkHasCompleted } = useActions();
  const [hideForever, toggleHideForever] = useToggle(false);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();

  const { data, isLoading } = useQuery<{
    streakRecover: UserStreakRecoverData;
  }>({
    queryKey: generateQueryKey(RequestKey.UserStreakRecover),
    queryFn: async () => await gqlClient.request(USER_STREAK_RECOVER_QUERY),
  });

  const recoverMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.UserStreakRecover),
    mutationFn: async () =>
      await gqlClient
        .request(USER_STREAK_RECOVER_MUTATION)
        .then((res) => res.recoverStreak),
    onSuccess: () => {
      displayToast('Lucky you! Your streak has been restored');
      logEvent({
        event_name: LogEvent.StreakRecover,
      });
    },
  });

  const onClose = useCallback(async () => {
    if (hideForever) {
      await completeAction(ActionType.DisableReadingStreakRecover);
      logEvent({
        event_name: LogEvent.DismissStreakRecover,
      });
    }

    onRequestClose?.();
  }, [completeAction, hideForever, logEvent, onRequestClose]);

  const onRecover = useCallback(async () => {
    try {
      await recoverMutation.mutateAsync();
      onRequestClose?.();
    } catch (e) {
      displayToast(
        'Oops! We are unable to recover your streak. Could you try again later?',
      );
    }
  }, [displayToast, onRequestClose, recoverMutation]);

  const isDisabled =
    !isActionsFetched ||
    checkHasCompleted(ActionType.DisableReadingStreakRecover);

  useEffect(() => {
    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakRecover,
      target_id: 'restore streak',
    });
  }, [logEvent]);

  return {
    hideForever: {
      isChecked: hideForever,
      toggle: toggleHideForever,
    },
    onClose,
    onRecover,
    recover: {
      ...data?.streakRecover,
      isLoading,
      isDisabled,
    },
  };
};

export default useStreakRecover;
