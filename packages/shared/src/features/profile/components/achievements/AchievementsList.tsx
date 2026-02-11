import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import classNames from 'classnames';
import type {
  AchievementSyncResult,
  UserAchievement,
} from '../../../../graphql/user/achievements';
import { getTargetCount } from '../../../../graphql/user/achievements';
import { AchievementCard } from './AchievementCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';
import type { PublicProfile } from '../../../../lib/user';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useAchievementSync } from '../../../../hooks/profile/useAchievementSync';
import { AchievementSyncModal } from '../ProfileWidgets/AchievementSyncModal';
import { useActions } from '../../../../hooks';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { ActionType } from '../../../../graphql/actions';
import { LazyModal } from '../../../../components/modals/common/types';

type FilterType = 'all' | 'unlocked' | 'locked';

const getEmptyMessage = (filter: FilterType): string => {
  if (filter === 'unlocked') {
    return 'No achievements unlocked yet';
  }
  if (filter === 'locked') {
    return 'All achievements unlocked!';
  }
  return 'No achievements available';
};

interface AchievementsListProps {
  achievements: UserAchievement[];
  user: PublicProfile;
  className?: string;
}

export function AchievementsList({
  achievements,
  user,
  className,
}: AchievementsListProps): ReactElement {
  const [filter, setFilter] = useState<FilterType>('all');
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user.id;
  const { syncStatus, syncAchievements, isSyncing, isStatusPending } =
    useAchievementSync(user);
  const [syncResult, setSyncResult] = useState<AchievementSyncResult | null>(
    null,
  );
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const { isActionsFetched, checkHasCompleted } = useActions();
  const { openModal } = useLazyModal();

  const syncButtonTitle = (() => {
    if (!syncStatus) {
      return undefined;
    }

    return syncStatus.canSync
      ? 'One-time sync available'
      : 'One-time sync already used';
  })();

  const handleSync = useCallback(async () => {
    if (!isOwner || isSyncing || syncStatus?.canSync === false) {
      return;
    }

    setSyncResult(null);
    setIsSyncModalOpen(true);

    try {
      const result = await syncAchievements();
      setSyncResult(result);
    } catch {
      setIsSyncModalOpen(false);
    }
  }, [isOwner, isSyncing, syncAchievements, syncStatus?.canSync]);

  useEffect(() => {
    if (
      !isActionsFetched ||
      !isOwner ||
      isStatusPending ||
      !syncStatus?.canSync ||
      checkHasCompleted(ActionType.AchievementSyncPrompt)
    ) {
      return;
    }

    openModal({
      type: LazyModal.AchievementSyncPrompt,
      props: { onSync: handleSync },
    });
  }, [
    isActionsFetched,
    isOwner,
    isStatusPending,
    syncStatus?.canSync,
    checkHasCompleted,
    openModal,
    handleSync,
  ]);

  const filteredAchievements = useMemo(() => {
    const sorted = [...achievements].sort((a, b) => {
      // Unlocked achievements come first
      if (a.unlockedAt && !b.unlockedAt) {
        return -1;
      }
      if (!a.unlockedAt && b.unlockedAt) {
        return 1;
      }
      // Among unlocked, sort by unlock date (most recent first)
      if (a.unlockedAt && b.unlockedAt) {
        return (
          new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
        );
      }
      // Among locked, sort by progress percentage (highest first)
      const targetA = getTargetCount(a.achievement);
      const targetB = getTargetCount(b.achievement);
      const progressA = targetA > 0 ? a.progress / targetA : 0;
      const progressB = targetB > 0 ? b.progress / targetB : 0;
      return progressB - progressA;
    });

    if (filter === 'all') {
      return sorted;
    }
    if (filter === 'unlocked') {
      return sorted.filter((a) => a.unlockedAt !== null);
    }
    return sorted.filter((a) => a.unlockedAt === null);
  }, [achievements, filter]);

  const unlockedCount = achievements.filter(
    (a) => a.unlockedAt !== null,
  ).length;
  const lockedCount = achievements.length - unlockedCount;

  const filters: { type: FilterType; label: string; count: number }[] = [
    { type: 'all', label: 'All', count: achievements.length },
    { type: 'unlocked', label: 'Unlocked', count: unlockedCount },
    { type: 'locked', label: 'Locked', count: lockedCount },
  ];

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {filters.map(({ type, label, count }) => (
            <Button
              key={type}
              variant={
                filter === type ? ButtonVariant.Primary : ButtonVariant.Subtle
              }
              onClick={() => setFilter(type)}
            >
              {label} ({count})
            </Button>
          ))}
        </div>
        {isOwner && syncStatus?.canSync && (
          <Button
            variant={ButtonVariant.Secondary}
            disabled={isSyncing || isStatusPending}
            onClick={handleSync}
            title={syncButtonTitle}
          >
            {isSyncing ? 'Syncing...' : 'Sync'}
          </Button>
        )}
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Typography
            type={TypographyType.Body}
            color={TypographyColor.Tertiary}
          >
            {getEmptyMessage(filter)}
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
          {filteredAchievements.map((userAchievement) => (
            <AchievementCard
              key={userAchievement.achievement.id}
              userAchievement={userAchievement}
            />
          ))}
        </div>
      )}
      {isSyncModalOpen && (
        <AchievementSyncModal
          isOpen={isSyncModalOpen}
          onRequestClose={() => setIsSyncModalOpen(false)}
          result={syncResult}
          isPending={isSyncing}
        />
      )}
    </div>
  );
}
