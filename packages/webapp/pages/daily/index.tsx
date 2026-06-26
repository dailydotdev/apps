import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { DailyHome } from '@dailydotdev/shared/src/features/daily/DailyHome';
import {
  useConditionalFeature,
  useScrollRestoration,
} from '@dailydotdev/shared/src/hooks';
import {
  DailyPageVariant,
  featureDailyPage,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getLayout } from '../../components/layouts/FeedLayout';

const seo: NextSeoProps = {
  title: 'Daily',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const DailyPage = (): ReactElement | null => {
  useScrollRestoration();
  const router = useRouter();
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { value: dailyVariant, isLoading } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isAuthReady && isLoggedIn,
  });

  const isResolved = isAuthReady && !isLoading;
  const dailyAsDefault = dailyVariant === DailyPageVariant.DailyAsDefault;
  const isAllowed =
    isLoggedIn && !!dailyVariant && dailyVariant !== DailyPageVariant.None;

  useEffect(() => {
    if (isResolved && (!isAllowed || dailyAsDefault)) {
      router.replace('/');
    }
  }, [isResolved, isAllowed, dailyAsDefault, router]);

  if (!isResolved || !isAllowed || dailyAsDefault) {
    return null;
  }

  return <DailyHome />;
};

DailyPage.getLayout = getLayout;
DailyPage.layoutProps = { mainPage: true, screenCentered: false, seo };

export default DailyPage;
