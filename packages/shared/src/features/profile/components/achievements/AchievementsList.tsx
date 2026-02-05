import type { ReactElement } from 'react';
import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import type { UserAchievement } from '../../../../graphql/user/achievements';
import { getTargetCount } from '../../../../graphql/user/achievements';
import { AchievementCard } from './AchievementCard';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { Button, ButtonVariant } from '../../../../components/buttons/Button';

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
  className?: string;
}

export function AchievementsList({
  achievements,
  className,
}: AchievementsListProps): ReactElement {
  const [filter, setFilter] = useState<FilterType>('all');

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
      <div className="flex gap-2">
        {filters.map(({ type, label, count }) => (
          <Button
            key={type}
            variant={
              filter === type ? ButtonVariant.Primary : ButtonVariant.Subtle
            }
            onClick={() => setFilter(type)}
            className="flex items-center gap-1.5"
          >
            {label}
            <Typography
              type={TypographyType.Footnote}
              color={
                filter === type
                  ? TypographyColor.Primary
                  : TypographyColor.Tertiary
              }
            >
              ({count})
            </Typography>
          </Button>
        ))}
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
    </div>
  );
}
