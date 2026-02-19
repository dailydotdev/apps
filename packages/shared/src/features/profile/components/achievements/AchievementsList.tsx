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
import { useTrackedAchievement } from '../../../../hooks/profile/useTrackedAchievement';
import { AchievementSyncModal } from '../ProfileWidgets/AchievementSyncModal';
import { useActions } from '../../../../hooks';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { ActionType } from '../../../../graphql/actions';
import { LazyModal } from '../../../../components/modals/common/types';
import { useConditionalFeature } from '../../../../hooks/useConditionalFeature';
import { achievementTrackingWidgetFeature } from '../../../../lib/featureManagement';

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
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user.id;
  const { trackedAchievement, trackAchievement, isTrackPending } =
    useTrackedAchievement(user.id, isOwner);
  const { syncStatus, syncAchievements, isSyncing, isStatusPending } =
    useAchievementSync(user);
  const [syncResult, setSyncResult] = useState<AchievementSyncResult | null>(
    null,
  );
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const { isActionsFetched, checkHasCompleted } = useActions();
  const { openModal, closeModal } = useLazyModal();
  const { value: isAchievementTrackingEnabled } = useConditionalFeature({
    feature: achievementTrackingWidgetFeature,
    shouldEvaluate: isOwner,
  });

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

  const handleTrack = useCallback(
    async (achievementId: string) => {
      setTrackingId(achievementId);
      try {
        await trackAchievement(achievementId);
      } finally {
        setTrackingId(null);
      }
    },
    [trackAchievement],
  );

  const filteredAchievements = useMemo(() => {
    const sorted = [...achievements].sort((a, b) => {
      // Unlocked achievements come first
      if (a.unlockedAt && !b.unlockedAt) {
        return -1;
      }
      if (!a.unlockedAt && b.unlockedAt) {
        return 1;
      }
      // Among unlocked, sort by rarity (rarest first), then points (highest first)
      if (a.unlockedAt && b.unlockedAt) {
        const rarityA = a.achievement.rarity ?? Infinity;
        const rarityB = b.achievement.rarity ?? Infinity;
        if (rarityA !== rarityB) {
          return rarityA - rarityB;
        }
        return b.achievement.points - a.achievement.points;
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

  const trackedAchievementId = trackedAchievement?.achievement.id;

  const openPicker = useCallback(() => {
    openModal({
      type: LazyModal.AchievementPicker,
      props: {
        achievements,
        trackedAchievementId,
        onTrack: async (id: string) => {
          await handleTrack(id);
          closeModal();
        },
      },
    });
  }, [openModal, achievements, trackedAchievementId, handleTrack, closeModal]);

  const showTrackingCta =
    isOwner && isAchievementTrackingEnabled && !trackedAchievementId && lockedCount > 0;

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

      {showTrackingCta && (
        <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
          <div>
            <Typography type={TypographyType.Callout} bold>
              Track an achievement
            </Typography>
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mt-0.5"
            >
              Pick an in-progress achievement to focus on.
            </Typography>
          </div>
          <Button
            variant={ButtonVariant.Primary}
            className="self-start"
            onClick={openPicker}
          >
            Choose achievement
          </Button>
        </div>
      )}

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
              isOwner={isOwner}
              isTracked={
                trackedAchievementId === userAchievement.achievement.id
              }
              isTrackPending={
                isTrackPending && trackingId === userAchievement.achievement.id
              }
              onTrack={handleTrack}
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
