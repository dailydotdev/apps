import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { AchievementsList } from './AchievementsList';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { ProfileEmptyScreen } from '../../../../components/profile/ProfileEmptyScreen';
import { MedalBadgeIcon } from '../../../../components/icons';

interface ProfileAchievementsProps {
  user: PublicProfile;
  className?: string;
}

function AchievementsSkeleton(): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 animate-pulse rounded-10 bg-surface-float"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-16 bg-surface-float"
          />
        ))}
      </div>
    </div>
  );
}

export function ProfileAchievements({
  user,
  className,
}: ProfileAchievementsProps): ReactElement {
  const { achievements, unlockedCount, totalCount, isPending, isError } =
    useProfileAchievements(user);

  if (isPending) {
    return (
      <div className={classNames('flex flex-col gap-4', className)}>
        <div className="flex items-center gap-2">
          <MedalBadgeIcon className="size-5 text-text-primary" />
          <Typography
            type={TypographyType.Body}
            tag={TypographyTag.H2}
            color={TypographyColor.Primary}
            bold
          >
            Achievements
          </Typography>
        </div>
        <AchievementsSkeleton />
      </div>
    );
  }

  if (isError || !achievements) {
    return (
      <div className={className}>
        <ProfileEmptyScreen
          title="Could not load achievements"
          text="Something went wrong while loading achievements. Please try again later."
        />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className={className}>
        <ProfileEmptyScreen
          title="No achievements yet"
          text="Achievements will appear here as you use daily.dev."
        />
      </div>
    );
  }

  return (
    <div className={classNames('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-2">
        <MedalBadgeIcon className="size-5 text-text-primary" />
        <Typography
          type={TypographyType.Body}
          tag={TypographyTag.H2}
          color={TypographyColor.Primary}
          bold
        >
          Achievements
        </Typography>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          ({unlockedCount}/{totalCount})
        </Typography>
      </div>
      <AchievementsList achievements={achievements} />
    </div>
  );
}
