import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  getAchievementSyncStatus,
  syncAchievements,
} from '../../graphql/user/achievements';
import type {
  AchievementSyncResult,
  AchievementSyncStatus,
} from '../../graphql/user/achievements';
import type { PublicProfile } from '../../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useToastNotification } from '../useToastNotification';

interface UseAchievementSyncResult {
  syncStatus: AchievementSyncStatus | undefined;
  isStatusPending: boolean;
  syncAchievements: () => Promise<AchievementSyncResult>;
  isSyncing: boolean;
}

const getSyncLimitMessage = (message?: string): boolean => {
  if (!message) {
    return false;
  }

  return (
    message.includes('ACHIEVEMENT_SYNC_LIMIT_REACHED') ||
    message.includes('already used your achievement sync')
  );
};

export const useAchievementSync = (
  user: PublicProfile,
): UseAchievementSyncResult => {
  const queryClient = useQueryClient();
  const { user: loggedUser } = useAuthContext();
  const { displayToast } = useToastNotification();
  const isOwner = loggedUser?.id === user.id;

  const achievementsQueryKey = generateQueryKey(
    RequestKey.UserAchievements,
    user,
    'profile',
  );

  const statusQueryKey = generateQueryKey(
    RequestKey.AchievementSyncStatus,
    user,
    'profile',
  );

  const { data, isPending } = useQuery({
    queryKey: statusQueryKey,
    queryFn: getAchievementSyncStatus,
    staleTime: StaleTime.Default,
    enabled: isOwner,
  });

  const { mutateAsync, isPending: isSyncing } = useMutation({
    mutationFn: syncAchievements,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: achievementsQueryKey });
      queryClient.setQueryData<AchievementSyncStatus>(statusQueryKey, {
        syncCount: result.syncCount,
        remainingSyncs: result.remainingSyncs,
        canSync: result.canSync,
        syncedAchievements: result.syncedAchievements,
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : undefined;

      if (getSyncLimitMessage(message)) {
        displayToast('You already used your one-time achievement sync.');
        return;
      }

      displayToast('Unable to sync achievements right now. Please try again.');
    },
  });

  const handleSync = useCallback(async () => {
    if (!isOwner) {
      throw new Error('Only the profile owner can sync achievements.');
    }

    return mutateAsync();
  }, [isOwner, mutateAsync]);

  return {
    syncStatus: data,
    isStatusPending: isPending,
    syncAchievements: handleSync,
    isSyncing,
  };
};
