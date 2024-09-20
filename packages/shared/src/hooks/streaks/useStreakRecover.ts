import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
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
import { useAlertsContext } from '../../contexts/AlertContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from './useReadingStreak';

interface UseStreakRecoverProps {
  onAfterClose?: () => void;
  onRequestClose: () => void;
}

export interface UseStreakRecoverReturn {
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

interface StreakQueryData {
  streakRecover: UserStreakRecoverData;
}

export const useStreakRecover = ({
  onAfterClose,
  onRequestClose,
}: UseStreakRecoverProps): UseStreakRecoverReturn => {
  const { isActionsFetched, completeAction, checkHasCompleted } = useActions();
  const [hideForever, toggleHideForever] = useToggle(false);
  const { displayToast } = useToastNotification();
  const { logEvent } = useLogContext();
  const { updateAlerts } = useAlertsContext();
  const { user } = useAuthContext();
  const { isStreaksEnabled } = useReadingStreak();
  const client = useQueryClient();
  const {
    query: { streak_restore: streakRestore },
  } = useRouter();

  const recoverMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.UserStreakRecover),
    mutationFn: async () =>
      await gqlClient
        .request(USER_STREAK_RECOVER_MUTATION)
        .then((res) => res.recoverStreak),
    onSuccess: () => {
      logEvent({
        event_name: LogEvent.StreakRecover,
      });

      client.invalidateQueries(generateQueryKey(RequestKey.UserStreak, user));
    },
  });

  const hideRemoteAlert = useCallback(async () => {
    await updateAlerts({
      showRecoverStreak: false,
    });
  }, [updateAlerts]);

  const { data, isLoading } = useQuery<StreakQueryData>({
    queryKey: generateQueryKey(RequestKey.UserStreakRecover),
    queryFn: async () => {
      const res = await gqlClient.request(USER_STREAK_RECOVER_QUERY);

      const userCantRecoverInNotificationCenter =
        !res?.streakRecover?.canRecover && !!streakRestore;
      if (userCantRecoverInNotificationCenter) {
        await hideRemoteAlert();
        displayToast('Oops, you are no longer eligible to restore your streak');
        onRequestClose?.();
        onAfterClose?.();
      }

      return res;
    },
    enabled: !!user && isStreaksEnabled && !hideForever,
  });

  const onClose = useCallback(async () => {
    if (hideForever) {
      await completeAction(ActionType.DisableReadingStreakRecover);
      logEvent({
        event_name: LogEvent.DismissStreakRecover,
      });
    }

    await hideRemoteAlert();
    onRequestClose?.();
    onAfterClose?.();
  }, [
    completeAction,
    hideForever,
    hideRemoteAlert,
    logEvent,
    onAfterClose,
    onRequestClose,
  ]);

  const onRecover = useCallback(async () => {
    try {
      await recoverMutation.mutateAsync();
      displayToast('Lucky you! Your streak has been restored');
    } catch (e) {
      displayToast(
        'Oops! We are unable to recover your streak. Could you try again later?',
      );
    }

    await onClose?.();
  }, [displayToast, onClose, recoverMutation]);

  const isDisabled =
    !isActionsFetched ||
    checkHasCompleted(ActionType.DisableReadingStreakRecover);

  useEffect(() => {
    if (!data?.streakRecover?.canRecover || isDisabled || isLoading) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.StreakRecover,
      target_id: 'restore streak',
    });
  }, [data?.streakRecover, isDisabled, isLoading, logEvent]);

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
