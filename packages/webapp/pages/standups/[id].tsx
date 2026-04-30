import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { LiveRoom } from '@dailydotdev/shared/src/components/liveRooms/LiveRoom';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const seo: NextSeoProps = {
  title: 'Standup | daily.dev',
  description: 'Join a developer standup on daily.dev.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
  },
  ...defaultSeo,
  noindex: true,
  nofollow: true,
};

const StandupPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main className="relative z-1 flex h-[calc(100dvh-4rem)] w-full flex-col">
      {typeof id === 'string' ? (
        <LiveRoom roomId={id} />
      ) : (
        <div className="flex flex-1 items-center justify-center py-10">
          <Loader />
        </div>
      )}
    </main>
  );
};

const getStandupPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

StandupPage.getLayout = getStandupPageLayout;
StandupPage.layoutProps = {
  screenCentered: false,
  hideFeedbackWidget: true,
  seo,
};

export default StandupPage;
