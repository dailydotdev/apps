import React, { ReactElement, ReactNode } from 'react';
import {
  getProfileSSR,
  getProfileV2ExtraSSR,
} from '@dailydotdev/shared/src/lib/user';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import { ClientError } from 'graphql-request';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities';
import classNames from 'classnames';
import { HeroImage } from '@dailydotdev/shared/src/components/profile/HeroImage';
import { UserMetadata } from '@dailydotdev/shared/src/components/profile/UserMetadata';
import { UserStats } from '@dailydotdev/shared/src/components/profile/UserStats';
import { SocialChips } from '@dailydotdev/shared/src/components/profile/SocialChips';
import { SquadsList } from '@dailydotdev/shared/src/components/profile/SquadsList';
import { ProfileV2 } from '@dailydotdev/shared/src/graphql/users';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { getLayout as getMainLayout } from '../MainLayout';
import NavBar, { tabs } from './NavBar';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../pages/404'),
);

export interface ProfileLayoutProps extends Partial<ProfileV2> {
  children?: ReactNode;
}

export default function ProfileLayout({
  user,
  userStats,
  sources,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isFallback } = router;

  const stats = { ...userStats, reputation: user?.reputation };

  if (!isFallback && !user) {
    return <Custom404 />;
  }

  if (!user) {
    return <></>;
  }

  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  return (
    <>
      {/* <Head> */}
      {/*  <link rel="preload" as="image" href={profile.image} /> */}
      {/* </Head> */}
      {/* <NextSeo {...Seo} /> */}
      <main
        className={classNames(
          pageBorders,
          pageContainerClassNames,
          'pb-12',
          'py-6',
        )}
      >
        <header className="flex px-4 h-8">
          <h2 className="font-bold typo-body">Profile</h2>
        </header>
        <HeroImage
          cover={user.cover}
          image={user.image}
          username={user.username}
          id={user.id}
        />
        <div className="flex flex-col px-4">
          <UserMetadata
            username={user.username}
            name={user.name}
            createdAt={user.createdAt}
          />
          <UserStats stats={stats} />
          <div className="text-theme-label-tertiary typo-callout">
            {user.bio}
          </div>
        </div>
        <SocialChips links={user} />
        <div className="flex flex-col gap-3 pl-4 mb-4">
          <div className="typo-footnote text-theme-label-tertiary">
            Active in these squads
          </div>
          <SquadsList memberships={sources.edges.map(({ node }) => node)} />
        </div>
        <NavBar selectedTab={selectedTab} profile={user} />
        {children}
      </main>
    </>
  );
}

export const getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, null),
  );

interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ProfileParams>): Promise<
  GetStaticPropsResult<Omit<ProfileLayoutProps, 'children'>>
> {
  const { userId } = params;
  try {
    const user = await getProfileSSR(userId);
    const data = await getProfileV2ExtraSSR(user.id);

    return {
      props: {
        user,
        ...data,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'FORBIDDEN') {
      return {
        props: {},
        revalidate: 60,
      };
    }
    throw err;
  }
}
