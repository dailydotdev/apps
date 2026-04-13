import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import type {
  HighlightsPageData,
  PostHighlightsFeedData,
} from '@dailydotdev/shared/src/graphql/highlights';
import {
  HIGHLIGHTS_PAGE_QUERY,
  MAJOR_HEADLINES_MAX_FIRST,
  POST_HIGHLIGHTS_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/highlights';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  HighlightsPage,
  HIGHLIGHTS_PAGE_QUERY_KEY,
} from '@dailydotdev/shared/src/components/highlights/HighlightsPage';
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

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<
  GetStaticPropsResult<HighlightsChannelPageProps>
> {
  const channel = params?.channel as string;
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: HIGHLIGHTS_PAGE_QUERY_KEY,
      queryFn: () =>
        gqlClient.request<HighlightsPageData>(HIGHLIGHTS_PAGE_QUERY, {
          first: MAJOR_HEADLINES_MAX_FIRST,
        }),
    }),
    queryClient.prefetchQuery({
      queryKey: ['channel-highlights-feed', channel],
      queryFn: () =>
        gqlClient.request<PostHighlightsFeedData>(POST_HIGHLIGHTS_FEED_QUERY, {
          channel,
        }),
    }),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
}
