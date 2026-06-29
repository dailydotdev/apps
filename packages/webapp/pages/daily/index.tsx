import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo/lib/types';
import { DailyHome } from '@dailydotdev/shared/src/features/daily/DailyHome';
import { useScrollRestoration } from '@dailydotdev/shared/src/hooks';
import { useDailyPage } from '@dailydotdev/shared/src/hooks/feed/useDailyPage';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';

const seo: NextSeoProps = {
  title: 'Daily',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const DailyPage = (): ReactElement | null => {
  useScrollRestoration();
  const router = useRouter();
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { isEnabled, isLoading } = useDailyPage();

  const isResolved = isAuthReady && !isLoading;
  const isAllowed = isLoggedIn && isEnabled;

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

DailyPage.getLayout = getMainFeedLayout;
DailyPage.layoutProps = { ...mainFeedLayoutProps, screenCentered: false, seo };

export default DailyPage;
