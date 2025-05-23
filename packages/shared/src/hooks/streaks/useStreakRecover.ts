import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useToggle } from '../useToggle';
import { useActions } from '../useActions';
import type { UserStreakRecoverData } from '../../graphql/users';
import {
  USER_STREAK_RECOVER_QUERY,
  USER_STREAK_RECOVER_MUTATION,
} from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ActionType } from '../../graphql/actions';
import type {
  ApiErrorResult,
  ApiResponseError,
  ApiUserTransactionErrorExtension,
} from '../../graphql/common';
import { ApiError, gqlClient } from '../../graphql/common';
import { useToastNotification } from '../useToastNotification';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { useAlertsContext } from '../../contexts/AlertContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from './useReadingStreak';
import { getPathnameWithQuery } from '../../lib/links';
import { webappUrl } from '../../lib/constants';
import { UserTransactionStatus } from '../../graphql/njord';
import type { LoggedUser } from '../../lib/user';
import { isExtension } from '../../lib/func';

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
    isRecoverPending: boolean;
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
  const { user, updateUser } = useAuthContext();
  const { isStreaksEnabled } = useReadingStreak();
  const client = useQueryClient();
  const router = useRouter();
  const {
    query: { streak_restore: streakRestore },
  } = router;

  const recoverMutation = useMutation({
    mutationKey: generateQueryKey(RequestKey.UserStreakRecover),
    mutationFn: async () =>
      await gqlClient
        .request<{
          recoverStreak: Pick<LoggedUser, 'balance'>;
        }>(USER_STREAK_RECOVER_MUTATION)
        .then((res) => res.recoverStreak),
    onSuccess: (data) => {
      logEvent({
        event_name: LogEvent.StreakRecover,
      });

      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.UserStreak, user),
      });
      client.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      if (data.balance) {
        updateUser({
          ...user,
          balance: data.balance,
        });
      }
    },
    onError: async (data: ApiErrorResult) => {
      if (
        data.response.errors?.[0]?.extensions?.code ===
        ApiError.BalanceTransactionError
      ) {
        const errorExtensions = data.response
          .errors[0] as ApiResponseError<ApiUserTransactionErrorExtension>;

        if (
          errorExtensions.extensions.status ===
            UserTransactionStatus.InsufficientFunds &&
          errorExtensions.extensions.balance
        ) {
          await updateUser({
            ...user,
            balance: errorExtensions.extensions.balance,
          });
        }
      }
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
      if (user.balance.amount < data.streakRecover.cost) {
        const searchParams = new URLSearchParams();
        searchParams.set('origin', Origin.StreakRecover);

        if (!isExtension) {
          searchParams.set('next', router.pathname);
        }

        router?.push(getPathnameWithQuery(`${webappUrl}cores`, searchParams));

        return;
      }

      await recoverMutation.mutateAsync();
      displayToast('Lucky you! Your streak has been restored');
    } catch (e) {
      displayToast(
        'Oops! We are unable to recover your streak. Could you try again later?',
      );
    }

    await onClose?.();
  }, [
    data?.streakRecover?.cost,
    displayToast,
    onClose,
    recoverMutation,
    router,
    user?.balance?.amount,
  ]);

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
      isRecoverPending: recoverMutation.isPending,
    },
  };
};

export default useStreakRecover;
