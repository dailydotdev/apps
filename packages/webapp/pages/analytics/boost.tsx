import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  BoostManager,
  BoostManagerLinks,
} from '@dailydotdev/shared/src/features/boost/BoostManager';
import { getLayout } from '../../components/layouts/MainLayout';
import {
  AnalyticsPageShell,
  AnalyticsTab,
} from '../../components/analytics/AnalyticsPageShell';

const BoostAnalytics = (): ReactElement => (
  <AnalyticsPageShell
    activeTab={AnalyticsTab.Boost}
    actions={<BoostManagerLinks />}
    isWide
  >
    <BoostManager />
  </AnalyticsPageShell>
);

const seo: NextSeoProps = {
  title: 'Boost manager',
  nofollow: true,
  noindex: true,
};

BoostAnalytics.getLayout = getLayout;
BoostAnalytics.layoutProps = { seo };

export default BoostAnalytics;
