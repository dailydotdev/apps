import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRequestProtocol } from '../useRequestProtocol';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { drainStreakViewQueue } from '../../lib/streakViewQueue';

// Replays post views that a flaky connection dropped (see useViewPost), on
// app load and whenever the browser comes back online.
//
// It deliberately does not read streak_optimistic_view: this mounts for every
// signed-in user on every load, and evaluating the flag here would enrol
// people who never open a post. Only useViewPost with the flag on fills the
// queue, so draining whatever is queued stays scoped to the treatment arm, and
// a user with an empty queue does no work beyond one storage read.
export const useStreakViewQueue = (): void => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { requestMethod, isCompanion } = useRequestProtocol();
  const userId = user?.id;

  useEffect(() => {
    if (!userId || isCompanion) {
      return undefined;
    }

    let isDraining = false;
    let shouldDrainAgain = false;
    const drain = async () => {
      if (isDraining) {
        shouldDrainAgain = true;
        return;
      }

      isDraining = true;

      try {
        const sent = await drainStreakViewQueue({
          userId,
          sendView: (id) => requestMethod(VIEW_POST_MUTATION, { id }),
        });

        if (sent > 0) {
          const streakUser = { id: userId };
          await client.invalidateQueries({
            queryKey: generateQueryKey(RequestKey.UserStreak, streakUser),
          });
          await client.invalidateQueries({
            queryKey: generateQueryKey(
              RequestKey.ReadingStreak30Days,
              streakUser,
            ),
          });
        }
      } finally {
        isDraining = false;

        if (shouldDrainAgain) {
          shouldDrainAgain = false;
          drain();
        }
      }
    };

    drain();
    window.addEventListener('online', drain);

    return () => window.removeEventListener('online', drain);
  }, [client, isCompanion, requestMethod, userId]);
};
