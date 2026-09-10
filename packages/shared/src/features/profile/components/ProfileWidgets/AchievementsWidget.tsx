import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../../components/utilities/Link';
import { ActivityContainer } from '../../../../components/profile/ActivitySection';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import type { PublicProfile } from '../../../../lib/user';
import { useProfileAchievements } from '../../../../hooks/profile/useProfileAchievements';
import { ClickableText } from '../../../../components/buttons/ClickableText';
import { MedalBadgeIcon } from '../../../../components/icons';
import { LazyImage } from '../../../../components/LazyImage';
import {
  getAchievementRarityTier,
  rarityGlowClasses,
} from '../achievements/achievementRarity';
import { RaritySparkles } from '../achievements/RaritySparkles';
import HoverCard from '../../../../components/cards/common/HoverCard';
import { AchievementCard } from '../achievements/AchievementCard';
import { AchievementsSnapshotCard } from '../../../snapshot/AchievementsSnapshotCard';
import { sortRarestUnlockedAchievements } from '../../../../components/modals/achievement/sortAchievements';
import { ProfileSnapshotButton } from '../../../snapshot/ProfileSnapshotButton';
import { Origin } from '../../../../lib/log';

interface AchievementsWidgetProps {
  user: PublicProfile;
}

function AchievementsSkeleton(): ReactElement {
  return (
    <div className="mt-3 flex gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="size-10 animate-pulse rounded-10 bg-surface-float"
        />
      ))}
    </div>
  );
}

function RecentAchievements({
  user,
}: {
  user: PublicProfile;
}): ReactElement | null {
  const { achievements, isPending } = useProfileAchievements(user);

  const rarestUnlocked = achievements
    ? sortRarestUnlockedAchievements(achievements).slice(0, 5)
    : undefined;

  if (isPending) {
    return <AchievementsSkeleton />;
  }

  if (rarestUnlocked && rarestUnlocked.length > 0) {
    return (
      <div className="mt-3 flex gap-2">
        {rarestUnlocked.map((ua) => {
          const rarityTier = getAchievementRarityTier(ua.achievement.rarity);
          return (
            <HoverCard
              key={ua.achievement.id}
              openDelay={300}
              sideOffset={8}
              trigger={
                <a
                  href={`/${user.username || user.id}/achievements`}
                  className={classNames(
                    'relative block size-10 rounded-10',
                    rarityTier
                      ? [
                          'overflow-visible border',
                          rarityGlowClasses[rarityTier],
                        ]
                      : 'overflow-hidden',
                  )}
                >
                  {rarityTier && (
                    <RaritySparkles tier={rarityTier} size="compact" />
                  )}
                  <LazyImage
                    imgSrc={ua.achievement.image}
                    imgAlt={ua.achievement.name}
                    className="size-full rounded-10 object-cover"
                    fallbackSrc="https://daily.dev/default-achievement.png"
                  />
                </a>
              }
            >
              <div className="w-80 rounded-16 bg-background-popover">
                <AchievementCard user={user} userAchievement={ua} />
              </div>
            </HoverCard>
          );
        })}
      </div>
    );
  }

  return (
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="mt-2"
    >
      No achievements unlocked yet
    </Typography>
  );
}

export function AchievementsWidget({
  user,
}: AchievementsWidgetProps): ReactElement {
  const { achievements, unlockedCount, totalCount, totalPoints } =
    useProfileAchievements(user);

  return (
    <ActivityContainer>
      <div className="flex items-center justify-between">
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Callout}
          color={TypographyColor.Primary}
          bold
          className="flex items-center gap-1"
        >
          <MedalBadgeIcon className="size-4" />
          Achievements
        </Typography>
        <div className="flex items-center gap-1">
          <Link href={`/${user.username || user.id}/achievements`} passHref>
            <ClickableText tag="a">
              {unlockedCount}/{totalCount}
            </ClickableText>
          </Link>
          {unlockedCount > 0 && (
            <ProfileSnapshotButton
              filename={`daily-achievements-${user.username ?? user.id}`}
              origin={Origin.AchievementsWidget}
              ownerId={user.id}
              renderCard={(ref) => (
                <AchievementsSnapshotCard
                  achievements={sortRarestUnlockedAchievements(
                    achievements ?? [],
                  )
                    .slice(0, 10)
                    .map(({ achievement }) => ({
                      image: achievement.image,
                      name: achievement.name,
                    }))}
                  points={totalPoints}
                  ref={ref}
                  seed={user.username ?? user.id}
                  total={totalCount}
                  unlocked={unlockedCount}
                  user={{
                    handle: `@${user.username ?? user.id}`,
                    image: user.image,
                    name: user.name,
                  }}
                />
              )}
            />
          )}
        </div>
      </div>
      <RecentAchievements user={user} />
    </ActivityContainer>
  );
}
