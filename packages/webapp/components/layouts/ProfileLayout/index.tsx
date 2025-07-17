import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import {
  getProfile,
  getProfileV2Extra,
} from '@dailydotdev/shared/src/lib/user';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ClientError } from 'graphql-request';
import type { ProfileV2 } from '@dailydotdev/shared/src/graphql/users';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo';
import { PageWidgets } from '@dailydotdev/shared/src/components/utilities';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import ConditionalWrapper from '@dailydotdev/shared/src/components/ConditionalWrapper';
import { ProfileUploadBanner } from '@dailydotdev/shared/src/features/profile/components/ProfileUploadBanner';
import { useActions } from '@dailydotdev/shared/src/hooks';
import { cvActions } from '@dailydotdev/shared/src/graphql/actions';
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

export const getOGImageUrl = (userId: string): string => {
  const ogImageUrl = new URL(
    `/devcards/v2/${userId}.png`,
    process.env.NEXT_PUBLIC_API_URL,
  );
  ogImageUrl.searchParams.set('type', 'wide');
  ogImageUrl.searchParams.set('r', Math.random().toString(36).substring(2, 5));
  return ogImageUrl.toString();
};

export const getProfileSeoDefaults = (
  user: PublicProfile,
  seoOverrides: NextSeoProps,
  noindex: boolean,
): NextSeoProps => {
  return {
    title: getTemplatedTitle(`${user.name} (@${user.username})`),
    description: user.bio ? user.bio : `Check out ${user.name}'s profile`,
    openGraph: {
      images: [{ url: getOGImageUrl(user.id) }],
    },
    twitter: {
      handle: user.twitter,
    },
    noindex,
    nofollow: noindex,
    ...seoOverrides,
  };
};

export default function ProfileLayout({
  user: initialUser,
  userStats,
  sources,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isFallback } = router;
  const { user, isUserSame } = useProfile(initialUser);
  const [trackedView, setTrackedView] = useState(false);
  const { logEvent } = useLogContext();
  const { actions, isActionsFetched } = useActions();
  const hasClosedBanner = useMemo(
    () => actions?.some(({ type }) => cvActions.includes(type)),
    [actions],
  );

  useEffect(() => {
    if (trackedView || !user) {
      return;
    }

    logEvent({
      event_name: LogEvent.ProfileView,
      target_id: user.id,
    });
    setTrackedView(true);
  }, [user, trackedView, logEvent]);

  if (!isFallback && !user) {
    return <Custom404 />;
  }

  if (!user || !isActionsFetched) {
    return <></>;
  }

  const selectedTab = tabs.findIndex((tab) => tab.path === router?.pathname);

  return (
    <ConditionalWrapper
      condition={isUserSame && !hasClosedBanner}
      wrapper={(component) => (
        <div className="flex w-full flex-col p-4">
          <ProfileUploadBanner className="!mt-0 tablet:mt-3" />
          {component}
        </div>
      )}
    >
      <div className="m-auto flex w-full max-w-screen-laptop flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:flex-row laptop:border-l laptop:border-r laptop:border-border-subtlest-tertiary laptop:pb-6 laptopL:pb-0">
        <Head>
          <link rel="preload" as="image" href={user.image} />
        </Head>
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
    </ConditionalWrapper>
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
    const user = await getProfile(userId);
    if (!user) {
      return {
        props: { noindex: true },
        revalidate: 60,
      };
    }
    const data = await getProfileV2Extra(user.id);

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
