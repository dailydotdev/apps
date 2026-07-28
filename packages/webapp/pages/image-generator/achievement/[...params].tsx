import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { UserAchievement } from '@dailydotdev/shared/src/graphql/user/achievements';
import { getUserAchievements } from '@dailydotdev/shared/src/graphql/user/achievements';
import { getProfile } from '@dailydotdev/shared/src/lib/user';
import type { AchievementShareCardUser } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShareCard';
import { AchievementShareCard } from '@dailydotdev/shared/src/features/profile/components/achievements/AchievementShareCard';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PageProps {
  userAchievement: UserAchievement;
  user: AchievementShareCardUser;
}

const notFound = { notFound: true, revalidate: false } as const;

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> {
  const [userId, achievementId] = (params?.params as string[]) ?? [];

  if (!userId || !achievementId) {
    return notFound;
  }

  try {
    const [profile, achievements] = await Promise.all([
      getProfile(userId),
      getUserAchievements(userId),
    ]);
    const userAchievement = achievements?.find(
      (item) => item.achievement.id === achievementId,
    );

    // Only unlocked achievements have something to celebrate — a locked one
    // would render a card claiming an achievement the user does not have.
    if (!profile || !userAchievement?.unlockedAt) {
      return notFound;
    }

    return {
      props: {
        userAchievement,
        user: {
          name: profile.name ?? null,
          username: profile.username ?? null,
          image: profile.image ?? null,
        },
      },
      revalidate: 60,
    };
  } catch {
    return notFound;
  }
}

const AchievementImagePage = ({
  userAchievement,
  user,
}: PageProps): ReactElement => (
  <div id="screenshot_wrapper" className="w-fit">
    <AchievementShareCard userAchievement={userAchievement} user={user} />
  </div>
);

export default AchievementImagePage;
