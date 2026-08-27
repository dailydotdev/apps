import type { ReactElement, ReactNode } from 'react';
import React, { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { MainLayoutProps } from '@dailydotdev/shared/src/components/MainLayout';
import type { MainFeedLayoutProps } from '@dailydotdev/shared/src/components/MainFeedLayout';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { getShouldRedirect } from '@dailydotdev/shared/src/components/utilities';
import type { GetDefaultFeedProps } from '@dailydotdev/shared/src/lib/feed';
import { getFeedName } from '@dailydotdev/shared/src/lib/feed';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import dynamic from 'next/dynamic';
import { SponsorDock } from '@dailydotdev/shared/src/components/sponsors/SponsorDock';
import { ValueRailSwitcher } from '@dailydotdev/shared/src/components/sponsors/ValueRailSwitcher';
import {
  MOCK_LEAD_SPONSOR,
  MOCK_PARTNER_SPONSORS,
} from '@dailydotdev/shared/src/components/sponsors/mockSponsors';
import { getLayout } from './FeedLayout';

const MainFeedLayout = dynamic(
  () =>
    import(
      /* webpackChunkName: "mainFeedLayout" */ '@dailydotdev/shared/src/components/MainFeedLayout'
    ),
  { ssr: true },
);

export type MainFeedPageProps = {
  children?: ReactNode;
  isFinder?: boolean;
} & Pick<MainFeedLayoutProps, 'searchChildren'>;

const getInternalFeedName = (
  path: string,
  options?: GetDefaultFeedProps,
): string => {
  if (path === '/') {
    return 'default';
  }

  if (path.startsWith('/search')) {
    return 'search';
  }

  if (path.startsWith('/feeds/')) {
    return getFeedName(path, options);
  }

  if (path === '/explore/[tag]' || path.startsWith('/explore/')) {
    return OtherFeedPage.ExploreTag;
  }

  return path.replace(/^\/+/, '');
};

const getFeedHeading = (feedName: string): string => {
  if (feedName === 'default') {
    return 'Developer Feed';
  }

  if (feedName === 'my-feed') {
    return 'My Feed';
  }

  if (feedName === 'search') {
    return 'Search Results';
  }

  return feedName
    .split('-')
    .map((word) => `${word[0]?.toUpperCase() || ''}${word.slice(1)}`)
    .join(' ');
};

export default function MainFeedPage({
  children,
  isFinder,
  searchChildren,
}: MainFeedPageProps): ReactElement {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const isFinderPage = router?.pathname === '/search/posts' || isFinder;
  const isMyFeedURL = router?.query?.slugOrId === user?.id;
  const [feedName, setFeedName] = useState(
    getInternalFeedName(router?.pathname, { isMyFeed: isMyFeedURL }),
  );
  const [isSearchOn, setIsSearchOn] = useState(!!isFinderPage);
  useEffect(() => {
    const isMyFeed = router?.pathname === '/my-feed';
    if (getShouldRedirect(isMyFeed, !!user)) {
      router.replace('/');
    } else if (isFinderPage) {
      setIsSearchOn(true);
      setFeedName('search');
    } else {
      const newFeed = getInternalFeedName(router?.pathname, {
        isMyFeed: isMyFeedURL,
      });
      if (isSearchOn) {
        setIsSearchOn(false);
      }
      if (newFeed) {
        if (feedName !== newFeed) {
          setFeedName(newFeed);
        }
      }
    }
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  if (!feedName) {
    return <></>;
  }

  return (
    <>
      <MainFeedLayout
        feedName={feedName}
        isSearchOn={isSearchOn}
        searchQuery={router.query?.q?.toString()}
        isFinder={isFinder}
        searchChildren={searchChildren}
      >
        <h1 className="sr-only">{getFeedHeading(feedName)}</h1>
        {children}
      </MainFeedLayout>
      {/*
       * MOCK-UP — do not merge. Concept A of the sponsored strip
       * with a value rail docked under it (see Storybook:
       * Extension/Sponsor Dock), wired onto the feed unconditionally
       * so it can be reviewed on a preview deployment. Both the
       * sponsors and the rail's data are fixtures; real inventory
       * needs an ad-service source and a flag, and the rail needs
       * wiring to trendingTags, before this is anything but a
       * picture. The rail defaults to Breaking news and its label is
       * a dropdown, so a reviewer can switch channels in place.
       */}
      <SponsorDock partners={MOCK_PARTNER_SPONSORS} primary={MOCK_LEAD_SPONSOR}>
        <ValueRailSwitcher />
      </SponsorDock>
    </>
  );
}

export function getMainFeedLayout(
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps: MainLayoutProps & MainFeedPageProps,
): ReactNode {
  return getLayout(
    <MainFeedPage {...layoutProps}>{page}</MainFeedPage>,
    pageProps,
    layoutProps,
  );
}

export const mainFeedLayoutProps: MainLayoutProps = {
  mainPage: true,
  screenCentered: false,
};
