import {
  UseMutateAsyncFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { getDay } from 'date-fns';
import { sendViewPost } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { ReadingDay, UserStreak } from '../../graphql/users';

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
    onSuccess: async (res) => {
      const streak = client.getQueryData<UserStreak>(streakKey);
      const isNewStreak = !streak?.lastViewAt;
      const isFirstViewToday =
        getDay(new Date(streak?.lastViewAt)) !== getDay(new Date());

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
