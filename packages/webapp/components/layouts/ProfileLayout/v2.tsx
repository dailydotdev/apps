import React, { ReactElement, ReactNode, useContext } from 'react';
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
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { NextSeoProps } from 'next-seo/lib/types';
import { Header } from '@dailydotdev/shared/src/components/profile/Header';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { getLayout as getMainLayout } from '../MainLayout';
import NavBar, { tabs } from './NavBar';
import { useDynamicHeader } from '../../../../shared/src/useDynamicHeader';
import { getTemplatedTitle } from '../utils';

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
  const { user: loggedUser } = useContext(AuthContext);
  const { ref: stickyRef, progress: stickyProgress } =
    useDynamicHeader<HTMLDivElement>();
  const hideSticky = !stickyProgress;

  if (!isFallback && !user) {
    return <Custom404 />;
  }

  if (!user) {
    return <></>;
  }

  const isSameUser = loggedUser?.id === user.id;
  const stats = { ...userStats, reputation: user?.reputation };
  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  const Seo: NextSeoProps = {
    title: getTemplatedTitle(user.name),
    description: user.bio ? user.bio : `Check out ${user.name}'s profile`,
    openGraph: {
      images: [{ url: user.image }],
    },
    twitter: {
      handle: user.twitter,
    },
  };

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={user.image} />
      </Head>
      <NextSeo {...Seo} />
      <main
        className={classNames(pageBorders, pageContainerClassNames, 'pb-12')}
      >
        <Header user={user} isSameUser={isSameUser} />
        {!hideSticky && (
          <Header
            user={user}
            isSameUser={isSameUser}
            sticky
            className="fixed top-0 left-0 z-3 w-full transition-transform duration-75 bg-theme-bg-primary"
            style={{ transform: `translateY(${(stickyProgress - 1) * 100}%)` }}
          />
        )}
        <HeroImage
          cover={user.cover}
          image={user.image}
          username={user.username}
          id={user.id}
          ref={stickyRef}
        />
        <div className="flex relative flex-col px-4">
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
          <SquadsList memberships={sources} userId={user.id} />
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
    if (!user) {
      return {
        props: {},
        revalidate: 60,
      };
    }
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
