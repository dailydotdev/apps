import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { sendViewPost } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { ReadingDay, UserStreak } from '../../graphql/users';
import { getTodayTz } from '../../lib/dateFormat';

export const useViewPost = (): UseMutateAsyncFunction<
  unknown,
  unknown,
  string
> => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const streakKey = generateQueryKey(RequestKey.UserStreak, user);
  const readKey = generateQueryKey(RequestKey.ReadingStreak30Days, user);
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost, {
    onSuccess: async () => {
      await client.invalidateQueries(streakKey);
      client.setQueryData<UserStreak>(streakKey, (data) => {
        const streak = { ...data };

        if (
          !streak?.lastViewAt ||
          new Date(streak.lastViewAt).getDate() !== new Date().getDate()
        ) {
          streak.max += 1;
          streak.total += 1;
          streak.current += 1;
        }

        streak.lastViewAt = new Date();

        return streak;
      });

      const reading = client.getQueryData<ReadingDay[]>(readKey);

      if (reading) {
        const timezoned = getTodayTz(user?.timezone || 'UTC');
        const date = timezoned.toISOString().split('T')[0];
        const index = reading.findIndex((read) => read.date === date);

        if (index === -1) {
          return client.setQueryData(readKey, [...reading, { date, reads: 1 }]);
        }

        const updatedReading = [...reading];
        updatedReading[index].reads += 1;
        return client.setQueryData(readKey, updatedReading);
      }

      return null;
    },
  });

  return onSendViewPost;
};
