import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendViewPost } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { ReadingDay, UserStreak } from '../../graphql/users';
import { getDayOfMonthInTimezone } from '../../lib/timezones';

export const useViewPost = (): UseMutateAsyncFunction<
  unknown,
  unknown,
  string
> => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const streakKey = generateQueryKey(RequestKey.UserStreak, user);
  const readKey = generateQueryKey(RequestKey.ReadingStreak30Days, user);
  const { mutateAsync: onSendViewPost } = useMutation({
    mutationFn: sendViewPost,
    onSuccess: async () => {
      const streak = client.getQueryData<UserStreak>(streakKey);
      const isNewStreak = !streak?.lastViewAt;
      const isFirstViewToday =
        getDayOfMonthInTimezone(new Date(streak?.lastViewAt), user.timezone) ===
        getDayOfMonthInTimezone(new Date(), user.timezone);

      if (isNewStreak || isFirstViewToday) {
        await client.refetchQueries({ queryKey: streakKey });
      }

      const reading = client.getQueryData<ReadingDay[]>(readKey);

      if (reading) {
        // just mark the query as stale
        await client.invalidateQueries({ queryKey: readKey });
      }

      return null;
    },
  });

  return onSendViewPost;
};
