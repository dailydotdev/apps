import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Post, sendViewPost } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { ReadingDay, UserStreak } from '../../graphql/users';

export const useViewPost = (
  post: Post,
): UseMutateAsyncFunction<unknown, unknown, string> => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const streakKey = generateQueryKey(RequestKey.UserStreak, user);
  const readKey = generateQueryKey(RequestKey.ReadingStreak30Days, user);
  const { mutateAsync: onSendViewPost } = useMutation(sendViewPost, {
    onSuccess: async () => {
      await client.invalidateQueries(streakKey);
      if (!post.read) {
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
      }

      const reading = client.getQueryData<ReadingDay[]>(readKey);

      if (reading) {
        // just mark the query as stale
        await client.invalidateQueries(readKey);
      }

      return null;
    },
  });

  return onSendViewPost;
};
