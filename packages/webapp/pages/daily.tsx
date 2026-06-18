import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { DailyHome } from '@dailydotdev/shared/src/features/daily/DailyHome';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks';
import {
  DailyPageVariant,
  featureDailyPage,
} from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { getLayout } from '../components/layouts/FeedLayout';

const seo: NextSeoProps = {
  title: 'Daily',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const DailyPage = (): ReactElement | null => {
  const router = useRouter();
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { value: dailyVariant, isLoading } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isAuthReady && isLoggedIn,
  });

  const isResolved = isAuthReady && !isLoading;
  const isAllowed = isLoggedIn && dailyVariant === DailyPageVariant.V1;

  useEffect(() => {
    if (isResolved && !isAllowed) {
      router.replace('/');
    }
  }, [isResolved, isAllowed, router]);

  if (!isResolved || !isAllowed) {
    return null;
  }

  return <DailyHome />;
};

DailyPage.getLayout = getLayout;
DailyPage.layoutProps = { mainPage: true, screenCentered: false, seo };

export default DailyPage;
