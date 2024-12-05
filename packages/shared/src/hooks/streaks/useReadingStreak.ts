import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext } from 'react';
import { getDay } from 'date-fns';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import {
  getReadingStreak,
  UPDATE_STREAK_COUNT_MUTATION,
  UserStreak,
} from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';
import { useActions } from '../useActions';
import { ActionType } from '../../graphql/actions';
import useDebounceFn from '../useDebounceFn';
import SettingsContext from '../../contexts/SettingsContext';
import { gqlClient, ResponseError } from '../../graphql/common';
import { DayOfWeek } from '../../lib/date';

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
      getDay(new Date(streak?.lastViewAt)) === getDay(new Date());

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
