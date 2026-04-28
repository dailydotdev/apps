import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import type { NextSeoProps } from 'next-seo';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const LiveRoom = dynamic(
  () =>
    import(
      /* webpackChunkName: "live-room" */
      '@dailydotdev/shared/src/components/liveRooms/LiveRoom'
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center py-10">
        <Loader />
      </div>
    ),
  },
);

const seo: NextSeoProps = {
  title: 'Live room | daily.dev',
  description: 'Join a live developer debate on daily.dev.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
  },
  ...defaultSeo,
  noindex: true,
  nofollow: true,
};

const LiveRoomPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main className="relative z-1 flex h-[calc(100dvh-4rem)] min-h-page w-full flex-col">
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

const getLiveRoomPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LiveRoomPage.getLayout = getLiveRoomPageLayout;
LiveRoomPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default LiveRoomPage;
