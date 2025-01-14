import type { UseMutateFunction } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { UserStreak } from '../../graphql/users';
import {
  getReadingStreak,
  UPDATE_STREAK_COUNT_MUTATION,
} from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import useDebounceFn from '../useDebounceFn';
import SettingsContext from '../../contexts/SettingsContext';
import type { ResponseError } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import type { DayOfWeek } from '../../lib/date';
import { isSameDayInTimezone } from '../../lib/timezones';

type UpdateReadingStreakConfig = {
  weekStart: DayOfWeek;
};

interface UserReadingStreak {
  streak: UserStreak;
  isLoading: boolean;
  isUpdatingConfig: boolean;
  shouldShowPopup: boolean;
  checkReadingStreak: () => void;
  isStreaksEnabled: boolean;
  updateStreakConfig: UseMutateFunction<
    UserStreak,
    ResponseError,
    UpdateReadingStreakConfig
  >;
}

export const useReadingStreak = (): UserReadingStreak => {
  const { user, isLoggedIn } = useAuthContext();
  const { optOutReadingStreak, loadedSettings } = useContext(SettingsContext);
  const { checkHasCompleted } = useActions();
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.UserStreak, user);

  const { data: streak, isPending: isPendingQuery } = useQuery({
    queryKey,
    queryFn: getReadingStreak,
    staleTime: StaleTime.Default,
    enabled: isLoggedIn,
    refetchIntervalInBackground: true,
  });

  const { mutate: updateStreakConfig, isPending: isPendingMutation } =
    useMutation<UserStreak, ResponseError, UpdateReadingStreakConfig>({
      mutationKey: generateQueryKey(RequestKey.UserStreak, user, 'config'),
      mutationFn: (params) =>
        gqlClient
          .request<{
            updateStreakConfig: UserStreak;
          }>(UPDATE_STREAK_COUNT_MUTATION, params)
          .then((res) =>
            queryClient.setQueryData(queryKey, res.updateStreakConfig),
          ),
    });

  const [clearQueries] = useDebounceFn(async () => {
    const hasReadToday =
      streak?.lastViewAt &&
      isSameDayInTimezone(
        new Date(streak.lastViewAt),
        new Date(),
        user.timezone,
      );

    if (!hasReadToday) {
      await queryClient.invalidateQueries({
        queryKey,
      });
    }
  }, 1000);

  const isStreaksEnabled = loadedSettings && !optOutReadingStreak;

  return {
    streak,
    isLoading: isPendingQuery,
    isUpdatingConfig: isPendingMutation,
    isStreaksEnabled,
    updateStreakConfig,
    checkReadingStreak: clearQueries,
    shouldShowPopup:
      isStreaksEnabled &&
      user?.createdAt < '2024-03-14T00:00:00.000Z' &&
      !checkHasCompleted(ActionType.ExistingUserSeenStreaks),
  };
};
