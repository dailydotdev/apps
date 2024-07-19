import React, { ReactElement, useEffect, useState } from 'react';
import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import {
  ANONYMOUS_FEED_QUERY,
  RankingAlgorithm,
} from '@dailydotdev/shared/src/graphql/feed';
import {
  OtherFeedPage,
  StaleTime,
  generateQueryKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  ViewSize,
  useConditionalFeature,
  useEventListener,
  useScrollRestoration,
  useViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import {
  isDevelopment,
  onboardingUrl,
  webappUrl,
} from '@dailydotdev/shared/src/lib/constants';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { cloudinary } from '@dailydotdev/shared/src/lib/image';
import classNames from 'classnames';
import { NextSeo, NextSeoProps } from 'next-seo';
import { authGradientBg } from '@dailydotdev/shared/src/components/auth';
import { useQueryClient } from '@tanstack/react-query';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { OnboardingLogs } from '@dailydotdev/shared/src/components/auth/OnboardingLogs';
import { useFeaturesReadyContext } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
  nofollow: true,
  noindex: true,
};

const DemoPage = (): ReactElement => {
  useScrollRestoration();
  const router = useRouter();
  const { user, showLogin, isAuthReady, isLoggedIn, anonymous } =
    useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const queryClient = useQueryClient();
  const { ready: featuresReady } = useFeaturesReadyContext();
  const { value: feedVersion } = useConditionalFeature({
    feature: feature.feedVersion,
    shouldEvaluate: featuresReady,
  });

  const feedProps: FeedProps<{
    version: number;
    ranking: RankingAlgorithm;
  }> = {
    feedName: OtherFeedPage.Welcome,
    feedQueryKey: generateQueryKey(OtherFeedPage.Welcome, user),
    query: ANONYMOUS_FEED_QUERY,
    pageSize: 10,
    allowFetchMore: false,
    disableAds: true,
    showSearch: false,
    options: {
      staleTime: StaleTime.Default,
    },
    variables: {
      version: isDevelopment ? 1 : feedVersion,
      ranking: RankingAlgorithm.Popularity,
    },
  };

  useEffect(() => {
    if (isLaptop) {
      router.replace(
        getPathnameWithQuery(onboardingUrl, window.location.search),
      );
    }
  }, [isLaptop, router]);

  useEffect(() => {
    if (isAuthReady && isLoggedIn) {
      router.replace(getPathnameWithQuery(webappUrl, window.location.search));
    }
  }, [isAuthReady, isLoggedIn, router]);

  const [didScroll, setDidScroll] = useState(false);
  useEventListener(globalThis, 'scroll', () => {
    setDidScroll(window.scrollY > 100);
  });
  const hasData = !!queryClient.getQueryData(feedProps.feedQueryKey);
  const showSignupFooter = didScroll || hasData;

  const instanceId = router.query?.aiid?.toString();
  const userId = user?.id || anonymous?.id;

  return (
    <>
      <NextSeo {...seo} />
      <OnboardingLogs userId={userId} instanceId={instanceId} />
      <div
        className={classNames(
          'sticky top-0 z-header flex h-12 w-full justify-between border-b border-accent-cabbage-default px-4 py-2',
          authGradientBg,
        )}
      >
        <Logo position={LogoPosition.Relative} />
        <Button
          onClick={() => showLogin({ trigger: AuthTriggers.WelcomePage })}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
        >
          Sign up
        </Button>
      </div>
      <div
        style={{
          backgroundImage: `url(${cloudinary.welcomePage.header.mainImage})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
        className="mb-6 flex h-80 flex-col items-center justify-center gap-2 p-6"
      >
        <h2 className="text-center font-bold text-text-primary typo-title1">
          Where developers suffer together
        </h2>
        <p className="text-center text-text-secondary typo-body">
          Personalized news feed, dev communities and search.much better than
          what&apos;s out there.
        </p>
      </div>
      {featuresReady && <Feed className={feedProps.className} {...feedProps} />}
      {showSignupFooter && (
        <div className="mb-6 flex h-80 flex-col items-center justify-center gap-6 p-6">
          <h2 className="text-center font-bold text-text-primary typo-title1">
            Where developers suffer together
          </h2>
          <Button
            onClick={() => showLogin({ trigger: AuthTriggers.WelcomePage })}
            variant={ButtonVariant.Primary}
            size={ButtonSize.Medium}
          >
            Sign up to continue ➔
          </Button>
        </div>
      )}
    </>
  );
};

const getPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

DemoPage.getLayout = getPageLayout;
DemoPage.layoutProps = {
  screenCentered: false,
};

export default DemoPage;
