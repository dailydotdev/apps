import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import { useRouter } from 'next/router';
import { AgentOnboardingScreen } from '@dailydotdev/shared/src/features/interests/components/AgentOnboardingScreen';
import { mockInterest } from '@dailydotdev/shared/src/features/interests/mock';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import ProtectedPage from '../../components/ProtectedPage';
import { getPageSeoTitles } from '../../components/layouts/utils';

const sampleQuery = 'Cool zig projects';

const Page = (): ReactElement | null => {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  const query =
    typeof router.query.q === 'string' && router.query.q.trim()
      ? router.query.q
      : sampleQuery;

  return (
    <ProtectedPage>
      <AgentOnboardingScreen
        key={query}
        query={query}
        recentInterest={mockInterest}
      />
    </ProtectedPage>
  );
};

const getAgentLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

const seo: NextSeoProps = {
  ...getPageSeoTitles('New agent'),
  nofollow: true,
  noindex: true,
};

Page.getLayout = getAgentLayout;
Page.layoutProps = { seo, screenCentered: false, hideFeedbackWidget: true };

export default Page;
