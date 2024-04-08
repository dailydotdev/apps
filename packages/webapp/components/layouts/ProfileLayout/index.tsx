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
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { getLayout as getMainLayout } from '../MainLayout';
import NavBar, { tabs } from './NavBar';
import { getTemplatedTitle } from '../utils';
import { ProfileWidgets } from '../../../../shared/src/components/profile/ProfileWidgets';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../pages/404'),
);

export interface ProfileLayoutProps extends Partial<ProfileV2> {
  noindex: boolean;
  children?: ReactNode;
}

export default function ProfileLayout({
  user: initialUser,
  userStats,
  sources,
  noindex,
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

  const ogImageUrl = new URL(
    `/devcards/v2/${user.id}.png`,
    process.env.NEXT_PUBLIC_API_URL,
  );
  ogImageUrl.searchParams.set('type', 'wide');
  ogImageUrl.searchParams.set('r', Math.random().toString(36).substring(2, 5));

  const Seo: NextSeoProps = {
    title: getTemplatedTitle(user.name),
    description: user.bio ? user.bio : `Check out ${user.name}'s profile`,
    openGraph: {
      images: [{ url: ogImageUrl.toString() }],
    },
    twitter: {
      handle: user.twitter,
    },
    noindex,
    nofollow: noindex,
  };

  return (
    <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
      <Head>
        <link rel="preload" as="image" href={user.image} />
      </Head>
      <NextSeo {...Seo} />
      <main className="relative flex flex-1 flex-col tablet:border-r tablet:border-border-subtlest-tertiary">
        <ProfileWidgets
          user={user}
          userStats={userStats}
          sources={sources}
          enableSticky
          className="laptop:hidden"
        />
        <NavBar selectedTab={selectedTab} profile={user} />
        {children}
      </main>
      <PageWidgets className="hidden !px-0 laptop:flex">
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
      customBanner: <CustomAuthBanner />,
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
        props: { noindex: true },
        revalidate: 60,
      };
    }
    const data = await getProfileV2ExtraSSR(user.id);

    return {
      props: {
        user,
        ...data,
        noindex: user.reputation <= 10,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'FORBIDDEN') {
      return {
        props: { noindex: true },
        revalidate: 60,
      };
    }
    throw err;
  }
}
