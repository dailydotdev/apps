import React, { ReactElement, useEffect } from 'react';
import Feed, { FeedProps } from '@dailydotdev/shared/src/components/Feed';
import { ANONYMOUS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
  OtherFeedPage,
  generateQueryKey,
} from '@dailydotdev/shared/src/lib/query';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { ViewSize, useViewSize } from '@dailydotdev/shared/src/hooks';
import { useRouter } from 'next/router';
import {
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
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/FeedLayout';
import { defaultOpenGraph, defaultSeo, defaultSeoTitle } from '../../next-seo';

const seo: NextSeoProps = {
  title: defaultSeoTitle,
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const DemoPage = (): ReactElement => {
  const router = useRouter();
  const { user, showLogin, isAuthReady, isLoggedIn } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  const feedProps: FeedProps<void> = {
    feedName: OtherFeedPage.Welcome,
    feedQueryKey: generateQueryKey(OtherFeedPage.Welcome, user),
    query: ANONYMOUS_FEED_QUERY,
    pageSize: 10,
    allowFetchMore: false,
    disableAds: true,
  };

  useEffect(() => {
    if (isLaptop) {
      router.replace(onboardingUrl);
    }
  }, [isLaptop, router]);

  useEffect(() => {
    if (isAuthReady && isLoggedIn) {
      router.replace(webappUrl);
    }
  }, [isAuthReady, isLoggedIn, router]);

  return (
    <>
      <NextSeo {...seo} />
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
      <Feed className={feedProps.className} {...feedProps} />
      <div className="mb-6 flex h-80 flex-col items-center justify-center gap-2 p-6">
        <h2 className="text-center font-bold text-text-primary typo-title1">
          Where developers suffer together
        </h2>
        <Button
          onClick={() => showLogin({ trigger: AuthTriggers.WelcomePage })}
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
        >
          Sign up to continue ➔
        </Button>
      </div>
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
