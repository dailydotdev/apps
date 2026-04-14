import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import {
  channelHighlightsFeedQueryOptions,
  highlightsPageQueryOptions,
} from '@dailydotdev/shared/src/graphql/highlights';
import { HighlightsPage } from '@dailydotdev/shared/src/components/highlights/HighlightsPage';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const HIGHLIGHTS_TITLE = 'Highlights | daily.dev';
const HIGHLIGHTS_DESCRIPTION =
  'Curated highlights from across the developer ecosystem. Stay on top of the most important stories, releases, and discussions.';

const HighlightsChannelPage = (): ReactElement => <HighlightsPage />;

const getHighlightsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

HighlightsChannelPage.getLayout = getHighlightsLayout;
HighlightsChannelPage.layoutProps = {
  screenCentered: false,
  seo: {
    title: HIGHLIGHTS_TITLE,
    description: HIGHLIGHTS_DESCRIPTION,
    openGraph: {
      ...defaultOpenGraph,
      title: HIGHLIGHTS_TITLE,
      description: HIGHLIGHTS_DESCRIPTION,
      type: 'website',
    },
    ...defaultSeo,
  },
};

export default HighlightsChannelPage;

interface HighlightsChannelPageProps {
  dehydratedState: DehydratedState;
}

interface HighlightsChannelPageParams extends ParsedUrlQuery {
  channel: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<HighlightsChannelPageParams>): Promise<
  GetStaticPropsResult<HighlightsChannelPageProps>
> {
  const channel = params?.channel;

  if (!channel) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  const queryClient = new QueryClient();
  const highlightsPage = await queryClient.fetchQuery(
    highlightsPageQueryOptions(),
  );
  const isKnownChannel = highlightsPage.channelConfigurations.some(
    ({ channel: configuredChannel }) => configuredChannel === channel,
  );

  if (!isKnownChannel) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  await queryClient.prefetchQuery(channelHighlightsFeedQueryOptions(channel));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
}
