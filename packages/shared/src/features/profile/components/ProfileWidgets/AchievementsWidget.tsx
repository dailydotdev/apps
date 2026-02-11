import type { ReactElement } from 'react';
import React from 'react';
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
import { Tooltip } from '../../../../components/tooltip/Tooltip';

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

  const recentUnlocked = achievements
    ?.filter((a) => a.unlockedAt !== null)
    .sort((a, b) => {
      const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
      const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  if (isPending) {
    return <AchievementsSkeleton />;
  }

  if (recentUnlocked && recentUnlocked.length > 0) {
    return (
      <div className="mt-3 flex gap-2">
        {recentUnlocked.map((ua) => (
          <Tooltip
            key={ua.achievement.id}
            content={
              <img
                src={ua.achievement.image}
                alt={ua.achievement.name}
                className="size-52 rounded-10 object-cover"
              />
            }
            className="overflow-hidden !bg-transparent !p-0"
          >
            <a
              href={ua.achievement.image}
              target="_blank"
              rel="noopener noreferrer"
              className="size-10 cursor-pointer overflow-hidden rounded-10"
            >
              <LazyImage
                imgSrc={ua.achievement.image}
                imgAlt={ua.achievement.name}
                className="size-full object-cover"
                fallbackSrc="https://daily.dev/default-achievement.png"
              />
            </a>
          </Tooltip>
        ))}
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
