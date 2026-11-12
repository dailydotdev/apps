import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../../contexts/AuthContext';
import { useRequestProtocol } from '../useRequestProtocol';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureStreakOptimisticView } from '../../lib/featureManagement';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { drainStreakViewQueue } from '../../lib/streakViewQueue';

// Replays post views that a flaky connection dropped (see useViewPost), on
// app load and whenever the browser comes back online.
export const useStreakViewQueue = (): void => {
  const client = useQueryClient();
  const { user } = useAuthContext();
  const { requestMethod, isCompanion } = useRequestProtocol();
  const userId = user?.id;
  const { value: isEnabled } = useConditionalFeature({
    feature: featureStreakOptimisticView,
    shouldEvaluate: !!userId && !isCompanion,
  });

  useEffect(() => {
    if (!isEnabled || !userId || isCompanion) {
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
  }, [client, isCompanion, isEnabled, requestMethod, userId]);
};
