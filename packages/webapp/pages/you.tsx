import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { YouPage } from '@dailydotdev/shared/src/components/shell/YouPage';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';

const seo: NextSeoProps = {
  title: 'You',
  noindex: true,
  nofollow: true,
};

const You = (): ReactElement => {
  const router = useRouter();
  const { user, isAuthReady } = useAuthContext();

  useEffect(() => {
    if (isAuthReady && !user) {
      router.replace('/');
    }
  }, [isAuthReady, user, router]);

  return <YouPage />;
};

const getYouLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

You.getLayout = getYouLayout;
You.layoutProps = { seo };

export default You;
