import type { ReactElement } from 'react';
import React from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { getProfile } from '@dailydotdev/shared/src/lib/user';
import type { UserStack } from '@dailydotdev/shared/src/graphql/user/userStack';
import { getUserStack } from '@dailydotdev/shared/src/graphql/user/userStack';
import { StackShareCard } from '@dailydotdev/shared/src/features/profile/components/stack/StackShareCard';

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface PageProps {
  user: PublicProfile;
  items: UserStack[];
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<PageProps>> {
  const userId = params?.userId;

  if (!userId || typeof userId !== 'string') {
    return {
      notFound: true,
      revalidate: false,
    };
  }

  try {
    const [user, stack] = await Promise.all([
      getProfile(userId),
      getUserStack(userId),
    ]);

    const items = stack.edges.map(({ node }) => node);

    if (!items.length) {
      return {
        notFound: true,
        revalidate: 60,
      };
    }

    return {
      props: { user, items },
      revalidate: 60,
    };
  } catch (err) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }
}

const StackSharePage = ({ user, items }: PageProps): ReactElement => {
  return (
    <div id="screenshot_wrapper" className="w-fit">
      <StackShareCard user={user} items={items} />
    </div>
  );
};

export default StackSharePage;
