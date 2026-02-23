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
    ?.filter((a) => a.unlockedAt !== null)
    .sort((a, b) => {
      const rarityA = a.achievement.rarity ?? Infinity;
      const rarityB = b.achievement.rarity ?? Infinity;
      if (rarityA !== rarityB) {
        return rarityA - rarityB;
      }

      const pointsDelta = b.achievement.points - a.achievement.points;
      if (pointsDelta !== 0) {
        return pointsDelta;
      }

      const unlockedDateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const unlockedDateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      if (unlockedDateA !== unlockedDateB) {
        return unlockedDateB - unlockedDateA;
      }

      return a.achievement.id.localeCompare(b.achievement.id);
    })
    .slice(0, 5);

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
              <div className="w-80">
                <AchievementCard userAchievement={ua} />
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
  const { unlockedCount, totalCount } = useProfileAchievements(user);

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
        <Link href={`/${user.username || user.id}/achievements`} passHref>
          <ClickableText tag="a">
            {unlockedCount}/{totalCount}
          </ClickableText>
        </Link>
      </div>
      <RecentAchievements user={user} />
    </ActivityContainer>
  );
}
