import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import type { ClientError } from 'graphql-request';
import {
  type DehydratedState,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { LiveRoom } from '@dailydotdev/shared/src/components/liveRooms/LiveRoom';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  LIVE_ROOM_QUERY,
  LiveRoomStatus,
  type LiveRoom as LiveRoomModel,
  type LiveRoomData,
} from '@dailydotdev/shared/src/graphql/liveRooms';
import { getPlainTextFromRichContent } from '@dailydotdev/shared/src/lib/strings';
import {
  RequestKey,
  StaleTime,
  generateQueryKey,
} from '@dailydotdev/shared/src/lib/query';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import type { DynamicSeoProps } from '../../components/common';
import { getAppOrigin } from '../../lib/seo';
import { getTemplatedTitle } from '../../components/layouts/utils';

const META_DESCRIPTION_LIMIT = 200;

interface StandupPageParams {
  id: string;
  [key: string]: string | string[] | undefined;
}

interface StandupPageProps extends DynamicSeoProps {
  id?: string;
  dehydratedState?: DehydratedState;
}

const StandupPage = (): ReactElement => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <main className="relative flex h-[calc(100dvh-var(--safe-area-top))] w-full flex-col px-safe laptop:h-[calc(100dvh-4rem)] laptop:px-0">
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

StandupPage.getLayout = getLayout;
StandupPage.layoutProps = {
  screenCentered: false,
  hideFeedbackWidget: true,
};

export default StandupPage;

const truncate = (value: string, max: number): string => {
  const trimmed = value.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
};

const formatScheduledTime = (value: string): string => {
  try {
    const date = new Date(value);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return '';
  }
};

const buildStandupSeo = (room: LiveRoomModel, url: string): NextSeoProps => {
  const topic = room.topic.trim();
  const hostName = room.host?.name ?? 'a daily.dev developer';

  const title = getTemplatedTitle(topic);
  const ogTopicByStatus: Record<LiveRoomStatus, string> = {
    [LiveRoomStatus.Live]: `Live: ${topic}`,
    [LiveRoomStatus.Created]: topic,
    [LiveRoomStatus.Ended]: topic,
  };
  const openGraphTitle = `${ogTopicByStatus[room.status] ?? topic} | daily.dev`;

  const baseDescription = getPlainTextFromRichContent({
    html: room.descriptionHtml,
  });
  const scheduledLine =
    room.status === LiveRoomStatus.Created && room.scheduledStart
      ? `Starts ${formatScheduledTime(room.scheduledStart)}.`
      : '';
  const fallbackByStatus: Record<LiveRoomStatus, string> = {
    [LiveRoomStatus.Live]: `Live now with ${hostName}. Tune in, ask questions, and join the conversation on daily.dev.`,
    [LiveRoomStatus.Created]:
      `Hosted by ${hostName}. ${scheduledLine} Listen in, take the mic, and join the conversation on daily.dev.`.trim(),
    [LiveRoomStatus.Ended]: `This developer standup with ${hostName} has ended. Catch the next one live on daily.dev.`,
  };
  const description = truncate(
    baseDescription ||
      fallbackByStatus[room.status] ||
      fallbackByStatus[LiveRoomStatus.Created],
    META_DESCRIPTION_LIMIT,
  );

  const openGraphDescription = truncate(
    baseDescription ||
      [
        `Hosted by ${hostName}.`,
        room.status === LiveRoomStatus.Live ? 'Live now on daily.dev.' : null,
        room.status === LiveRoomStatus.Created ? scheduledLine : null,
        'Tune in, ask questions, and join the conversation.',
      ]
        .filter(Boolean)
        .join(' '),
    META_DESCRIPTION_LIMIT,
  );

  return {
    ...defaultSeo,
    title,
    description,
    canonical: url,
    noindex: true,
    nofollow: true,
    openGraph: {
      ...defaultOpenGraph,
      type: 'website',
      url,
      title: openGraphTitle,
      description: openGraphDescription,
    },
    twitter: {
      cardType: 'summary_large_image',
    },
  };
};

const fallbackSeo: NextSeoProps = {
  ...defaultSeo,
  title: 'Standup | daily.dev',
  description: 'Join a developer standup on daily.dev.',
  openGraph: {
    ...defaultOpenGraph,
    type: 'website',
  },
  noindex: true,
  nofollow: true,
};

export async function getServerSideProps({
  params,
  req,
  res,
}: GetServerSidePropsContext<StandupPageParams>): Promise<
  GetServerSidePropsResult<StandupPageProps>
> {
  const id = params?.id;
  if (!id) {
    return { notFound: true };
  }

  res.setHeader(
    'Cache-Control',
    `public, max-age=0, must-revalidate, s-maxage=${
      StaleTime.OneMinute / 1000
    }, stale-while-revalidate=${StaleTime.OneMinute / 1000}`,
  );

  try {
    const data = await gqlClient.request<LiveRoomData>(
      LIVE_ROOM_QUERY,
      { id },
      req.headers.cookie ? { Cookie: req.headers.cookie } : undefined,
    );
    const url = `${getAppOrigin()}/standups/${id}`;
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      generateQueryKey(RequestKey.LiveRooms, undefined, 'detail', id),
      data.liveRoom,
    );
    return {
      props: {
        id,
        seo: buildStandupSeo(data.liveRoom, url),
        dehydratedState: dehydrate(queryClient),
      },
    };
  } catch (err) {
    const errorCode = (err as ClientError)?.response?.errors?.[0]?.extensions
      ?.code;
    if (errorCode === ApiError.NotFound) {
      return { notFound: true };
    }
    return {
      props: {
        id,
        seo: fallbackSeo,
      },
    };
  }
}
