import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendViewPost } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { UserStreak } from '../../graphql/users';
import { isSameDayInTimezone } from '../../lib/timezones';

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
      if (!user) {
        return;
      }

      const streak = client.getQueryData<UserStreak>(streakKey);
      const isNewStreak = !streak?.lastViewAt;
      const isFirstViewToday =
        !!streak?.lastViewAt &&
        !isSameDayInTimezone(
          new Date(streak.lastViewAt),
          new Date(),
          user.timezone,
        );

      if (isNewStreak || isFirstViewToday) {
        await client.refetchQueries({ queryKey: streakKey });

        // just mark the query as stale
        await client.invalidateQueries({ queryKey: readKey });
      }
    },
  });

  return onSendViewPost;
};
