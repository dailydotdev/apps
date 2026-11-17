import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { ReputationDashboard } from '@dailydotdev/shared/src/components/analytics/reputation/ReputationDashboard';
import { getLayout } from '../../components/layouts/MainLayout';
import {
  AnalyticsPageShell,
  AnalyticsTab,
} from '../../components/analytics/AnalyticsPageShell';

const ReputationAnalytics = (): ReactElement => (
  <AnalyticsPageShell activeTab={AnalyticsTab.Reputation}>
    <ReputationDashboard />
  </AnalyticsPageShell>
);

const seo: NextSeoProps = {
  title: 'Reputation analytics',
  nofollow: true,
  noindex: true,
};

ReputationAnalytics.getLayout = getLayout;
ReputationAnalytics.layoutProps = { seo };

export default ReputationAnalytics;
