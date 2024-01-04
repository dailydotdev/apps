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
import { ProfileV2 } from '@dailydotdev/shared/src/graphql/users';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import { NextSeoProps } from 'next-seo/lib/types';
import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { getLayout as getMainLayout } from '../MainLayout';
import NavBar, { tabs } from './NavBar';
import { getTemplatedTitle } from '../utils';
import { ProfileWidgets } from '../../../../shared/src/components/profile/ProfileWidgets';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../pages/404'),
);

export interface ProfileLayoutProps extends Partial<ProfileV2> {
  children?: ReactNode;
}

export default function ProfileLayout({
  user: initialUser,
  userStats,
  sources,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isFallback } = router;
  const user = useProfile(initialUser);

  if (!isFallback && !user) {
    return <Custom404 />;
  }

  if (!user) {
    return <></>;
  }

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
    <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:flex-row tablet:pb-0 laptop:min-h-page laptop:border-l laptop:border-r laptop:border-theme-divider-tertiary laptop:pb-6 laptopL:pb-0">
      <Head>
        <link rel="preload" as="image" href={user.image} />
      </Head>
      <NextSeo {...Seo} />
      <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-theme-divider-tertiary">
        <ProfileWidgets
          user={user}
          userStats={userStats}
          sources={sources}
          enableSticky
          className="tablet:hidden"
        />
        <NavBar selectedTab={selectedTab} profile={user} />
        {children}
      </main>
      <PageWidgets className="hidden !px-0 tablet:flex">
        <ProfileWidgets
          user={user}
          userStats={userStats}
          sources={sources}
          className="w-full"
        />
      </PageWidgets>
    </div>
  );
}

export const getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, null, {
      screenCentered: false,
    }),
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
