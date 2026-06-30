import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { useConditionalFeature } from '@dailydotdev/shared/src/hooks/useConditionalFeature';
import { featureGiveback } from '@dailydotdev/shared/src/lib/featureManagement';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { GivebackPage } from '@dailydotdev/shared/src/features/giveback/components/GivebackPage';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Giveback');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: {
    ...defaultOpenGraph,
    ...seoTitles.openGraph,
  },
  ...defaultSeo,
  description:
    'daily.dev would rather fund real-world causes than pay for ads. Take small actions to help us grow, and we turn that budget into donations to the causes you choose, at no cost to you.',
  nofollow: true,
  noindex: true,
};

const GivebackRoute = (): ReactElement | null => {
  const router = useRouter();
  const { isAuthReady } = useAuthContext();
  const { value: isEnabled, isLoading } = useConditionalFeature({
    feature: featureGiveback,
    shouldEvaluate: isAuthReady,
  });

  useEffect(() => {
    if (!isLoading && !isEnabled) {
      router.replace(webappUrl);
    }
  }, [isLoading, isEnabled, router]);

  if (!isEnabled) {
    return null;
  }

  return <GivebackPage />;
};

const getGivebackLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

GivebackRoute.getLayout = getGivebackLayout;
GivebackRoute.layoutProps = { screenCentered: false, seo };

export default GivebackRoute;
