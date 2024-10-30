import {
  UseMutateFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext, useRef } from 'react';
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
  shouldShowPopup: boolean;
  checkReadingStreak: () => Promise<void>;
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
  const queryClient = useQueryClient();
  const queryKey = generateQueryKey(RequestKey.UserStreak, user);

  const { data: streak, isPending } = useQuery({
    queryKey,
    queryFn: getReadingStreak,
    staleTime: StaleTime.Default,
    enabled: isLoggedIn,
  });

  const { mutate: updateStreakConfig } = useMutation<
    UserStreak,
    ResponseError,
    UpdateReadingStreakConfig
  >({
    mutationFn: (params) =>
      gqlClient.request(UPDATE_STREAK_COUNT_MUTATION, params),

    onMutate: ({ weekStart }) => {
      queryClient.cancelQueries({ queryKey });

      const currentStreak = queryClient.getQueryData<UserStreak>(queryKey);

      queryClient.setQueryData(queryKey, (prev: UserStreak) => ({
        ...prev,
        weekStart,
      }));

      return () => {
        queryClient.setQueryData(queryKey, currentStreak);
      };
    },
  });
  const { checkHasCompleted } = useActions();
  const hasReadToday =
    new Date(streak?.lastViewAt).getDate() === new Date().getDate();
  const userStreakQueryKeyRef = useRef<unknown[]>();

  const [clearQueries] = useDebounceFn(async () => {
    if (!hasReadToday && userStreakQueryKeyRef.current?.length > 0) {
      await queryClient.invalidateQueries({
        queryKey: userStreakQueryKeyRef.current,
      });
    }
  }, 100);

  const isStreaksEnabled = loadedSettings && !optOutReadingStreak;

  return {
    streak,
    isLoading: isPending,
    isStreaksEnabled,
    updateStreakConfig,
    checkReadingStreak: async () => {
      const userStreakQueryKey = queryKey;
      userStreakQueryKeyRef.current = userStreakQueryKey;

      clearQueries(hasReadToday ?? true);
    },
    shouldShowPopup:
      isStreaksEnabled &&
      user?.createdAt < '2024-03-14T00:00:00.000Z' &&
      !checkHasCompleted(ActionType.ExistingUserSeenStreaks),
  };
};
