import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { StreakShareCard } from '@dailydotdev/shared/src/components/streak/StreakShareCard';
import type { PublicUserStreak } from '@dailydotdev/shared/src/graphql/users';
import { getUserStreakProfile } from '@dailydotdev/shared/src/graphql/users';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PageProps {
  streak: PublicUserStreak;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> {
  const userId = params?.userId as string;

  if (!userId) {
    return { notFound: true, revalidate: false };
  }

  const streak = await getUserStreakProfile(userId);

  if (!streak) {
    return { notFound: true, revalidate: false };
  }

  return { props: { streak }, revalidate: 60 };
}

const StreakImagePage = ({ streak }: PageProps): ReactElement => (
  <div id="screenshot_wrapper" className="w-fit">
    <StreakShareCard streak={streak} />
  </div>
);

export default StreakImagePage;
