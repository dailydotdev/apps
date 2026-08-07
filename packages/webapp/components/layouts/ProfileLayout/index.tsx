import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
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
import { ClientQuestEventType } from '@dailydotdev/shared/src/graphql/quests';
import { useProfile } from '@dailydotdev/shared/src/hooks/profile/useProfile';
import { useTrackQuestClientEvent } from '@dailydotdev/shared/src/hooks/useTrackQuestClientEvent';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { PublicPageSignupBanner } from '@dailydotdev/shared/src/components/auth/PublicPageSignupBanner';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { LogEvent, TargetType } from '@dailydotdev/shared/src/lib/log';
import { usePostReferrerContext } from '@dailydotdev/shared/src/contexts/PostReferrerContext';
import { PageHeader } from '@dailydotdev/shared/src/components/layout/PageHeader';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import { useLayoutVariant } from '@dailydotdev/shared/src/hooks/layout/useLayoutVariant';
import { getLayout as getFooterNavBarLayout } from '../FooterNavBarLayout';
import { getLayout as getMainLayout } from '../MainLayout';
import { getPageSeoTitles } from '../utils';
import { getAppOrigin } from '../../../lib/seo';
import { ProfileWidgets } from '../../../../shared/src/features/profile/components/ProfileWidgets/ProfileWidgets';
import { useProfileSidebarCollapse } from '../../../hooks/useProfileSidebarCollapse';
import { hasPublicWorld } from '../../world/profileWorld';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../../pages/404'),
);
const appOrigin = getAppOrigin();

export interface ProfileLayoutProps extends Partial<ProfileV2> {
  noindex: boolean;
  children?: ReactNode;
  // v2: title shown in the shared page-header strip at the top of the
  // floating card, above the profile sidebar + main + aside row.
  pageHeaderTitle?: string;
  /** Whether this reader has a world a visitor is allowed to walk into. */
  hasWorld?: boolean;
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

const getTwitterHandle = (user: PublicProfile): string | undefined => {
  const twitterLink = user.socialLinks?.find(
    (link) => link.platform === 'twitter',
  );
  if (!twitterLink?.url) {
    return undefined;
  }
  // Extract handle from URL like https://x.com/username or https://twitter.com/username
  const match = twitterLink.url.match(/(?:twitter\.com|x\.com)\/([^/?]+)/);
  return match?.[1];
};

export const getProfileSeoDefaults = (
  user: PublicProfile,
  seoOverrides: NextSeoProps,
  noindex: boolean,
): NextSeoProps => {
  const profileSeoTitles = getPageSeoTitles(`${user.name} (@${user.username})`);
  const openGraphImages = [{ url: getOGImageUrl(user.id) }];

  return {
    title: profileSeoTitles.title,
    description: user.bio ? user.bio : `Check out ${user.name}'s profile`,
    // Intentionally canonicalize profile surfaces to the main username URL.
    canonical: `${appOrigin}/${user.username}`,
    twitter: {
      handle: getTwitterHandle(user),
    },
    noindex,
    nofollow: noindex,
    ...seoOverrides,
    openGraph: {
      ...profileSeoTitles.openGraph,
      images: openGraphImages,
      ...seoOverrides.openGraph,
    },
  };
};

export default function ProfileLayout({
  user: initialUser,
  userStats,
  sources,
  pageHeaderTitle,
  children,
}: ProfileLayoutProps): ReactElement {
  const router = useRouter();
  const { isV2 } = useLayoutVariant();
  const { isFallback } = router;
  const { user } = useProfile(initialUser);
  const { user: viewer } = useAuthContext();
  const [trackedView, setTrackedView] = useState(false);
  const { logEvent } = useLogContext();
  const referrerPost = usePostReferrerContext()?.referrerPost;
  useTrackQuestClientEvent({
    eventType: ClientQuestEventType.ViewUserProfile,
    enabled: !!user && !!viewer?.id && viewer.id !== user.id,
    eventKey: user ? `profile:${user.id}` : undefined,
  });

  // Auto-collapse sidebar on small screens
  useProfileSidebarCollapse();

  useEffect(() => {
    if (trackedView || !user) {
      return;
    }

    logEvent({
      event_name: LogEvent.ProfileView,
      target_id: user.id,
      ...(!!referrerPost && {
        extra: JSON.stringify({
          referrer_target_id: referrerPost.id,
          referrer_target_type: TargetType.Post,
          author: user?.id && referrerPost.author?.id === user.id ? 1 : 0,
        }),
      }),
    });
    setTrackedView(true);
  }, [user, trackedView, logEvent, referrerPost]);

  if (!isFallback && !user) {
    return <Custom404 />;
  }

  if (!user) {
    return <></>;
  }

  return (
    <div className="flex w-full flex-col">
      <Head>
        <link rel="preload" as="image" href={user.image} />
      </Head>
      {isV2 && pageHeaderTitle && (
        <PageHeader title={pageHeaderTitle} className="hidden laptop:flex" />
      )}
      <div className="profile-page m-auto flex w-full flex-col pb-12 tablet:pb-0 laptop:min-h-page laptop:max-w-5xl laptop:flex-row laptop:gap-4 laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
        <main className="relative flex flex-1 flex-col laptop:max-w-2xl laptopL:max-w-3xl">
          {children}
        </main>
        <aside className="hidden min-w-0 laptop:flex laptop:max-w-80 laptop:flex-shrink laptop:flex-col">
          {userStats && sources && (
            <ProfileWidgets
              user={user}
              userStats={userStats}
              sources={sources}
              className="w-full"
            />
          )}
        </aside>
      </div>
      <PublicPageSignupBanner />
    </div>
  );
}

export const getLayout = (
  page: ReactNode,
  props: ProfileLayoutProps,
  layoutProps?: MainLayoutProps,
): ReactNode =>
  getFooterNavBarLayout(
    getMainLayout(<ProfileLayout {...props}>{page}</ProfileLayout>, undefined, {
      screenCentered: false,
      customBanner: <CustomAuthBanner />,
      layoutVariant: 'v1',
      ...layoutProps,
    }),
  );

interface ProfileParams extends ParsedUrlQuery {
  userId: string;
}

// `blocking`, not `true`. `pages/[userId]` is a ROOT-LEVEL dynamic
// route, so it claims every single-segment path on the apex — and with
// `fallback: true` Next answers all of them with a loading shell under
// HTTP 200 before `getStaticProps` ever runs. That made `daily.dev/`
// plus any unknown segment indistinguishable from a real profile:
// `/definitely-not-a-user-xyz123` and `/kramer` both returned the same
// 10,549-byte body. Crawlers and agents read the status code, so every
// missing page looked like a hit. `blocking` resolves the profile
// first, which is what lets the `notFound` below produce a real 404.
export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

// A missing profile is a 404, not a 200 with `noindex`.
//
// The layout has always rendered the right thing for this case —
// `if (!isFallback && !user) return <Custom404 />` — it just served it
// under a success status, and `noindex` suppressed the search-engine
// symptom rather than fixing the response. `notFound: true` renders
// the same `pages/404.tsx` with the status to match, and keeps
// `revalidate` so a profile created later starts resolving within the
// window instead of being cached as missing forever.
const profileNotFound = {
  notFound: true,
  revalidate: 60,
} as const;

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ProfileParams>): Promise<
  GetStaticPropsResult<Omit<ProfileLayoutProps, 'children'>>
> {
  const userId = params?.userId;
  if (!userId) {
    return profileNotFound;
  }
  try {
    const user = await getProfile(userId);
    if (!user) {
      return profileNotFound;
    }
    // Both only need the resolved id, so neither has to wait on the other.
    const [data, hasWorld] = await Promise.all([
      getProfileV2Extra(user.id),
      hasPublicWorld(user.id),
    ]);

    return {
      props: {
        user,
        ...data,
        hasWorld,
        noindex: !!user.noindex,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    if (clientError?.response?.errors?.[0]?.extensions?.code === 'FORBIDDEN') {
      // Same answer as a missing profile, deliberately: the viewer
      // cannot see it, and 404 avoids confirming that the handle
      // exists. This path already rendered `<Custom404 />` too.
      return profileNotFound;
    }
    throw err;
  }
}
