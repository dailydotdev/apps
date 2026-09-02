import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get as getCache, set as setCache } from 'idb-keyval';

function getAsyncCache<T>(
  key: string,
  valueWhenCacheEmpty: T | null,
  validValues?: T[],
): Promise<T | null> {
  return getCache<T>(key)
    .then((cachedValue) => {
      if (
        cachedValue !== undefined &&
        (validValues === undefined || validValues.includes(cachedValue))
      ) {
        return cachedValue;
      }
      return valueWhenCacheEmpty;
    })
    .catch(() => {
      return valueWhenCacheEmpty;
    });
}

export type UserPersistentContextType<T> = [
  T,
  (value: T) => Promise<void>,
  boolean,
  boolean,
];

// Supplying an empty-cache value means the hook can always hand back a T.
// Omitting it means an empty cache resolves to null, and the overloads say so
// rather than leaving the caller to read the body for the rule.
export default function usePersistentContext<T>(
  key: string,
  valueWhenCacheEmpty: T,
  validValues?: T[],
  fallbackValue?: T,
): UserPersistentContextType<T>;
export default function usePersistentContext<T>(
  key: string,
): UserPersistentContextType<T | null>;
export default function usePersistentContext<T>(
  key: string,
  valueWhenCacheEmpty?: T,
  validValues?: T[],
  fallbackValue?: T,
): UserPersistentContextType<T | null> {
  const queryKey = [key, valueWhenCacheEmpty];
  const queryClient = useQueryClient();

  const { data, isFetched } = useQuery({
    queryKey,
    queryFn: () =>
      getAsyncCache<T>(key, valueWhenCacheEmpty || null, validValues) || null,
  });

  const { mutateAsync: updateValue, isPending: isLoading } = useMutation({
    mutationFn: (value: T | null) => setCache(key, value),

    onMutate: (mutatedData) => {
      const current = data;
      queryClient.setQueryData(queryKey, mutatedData);
      return current;
    },

    onError: (_, __, rollback) => {
      queryClient.setQueryData(queryKey, rollback);
    },
  });

  return [data ?? fallbackValue ?? null, updateValue, isFetched, isLoading];
}

export enum PersistentContextKeys {
  AlertPushKey = 'alert_push_key',
  StreakAlertPushKey = 'streak_alert_push_key',
  PendingOpportunityId = 'pending_opportunity_id',
  ReadingReminderLastSeen = 'reading_reminder_last_seen',
  QuestOffersLastSeen = 'quest_offers_last_seen',
  QuestOffersEligibleLogged = 'quest_offers_eligible_logged',
}
