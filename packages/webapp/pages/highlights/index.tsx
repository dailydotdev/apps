import type { GetStaticPropsResult } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { highlightsPageQueryOptions } from '@dailydotdev/shared/src/graphql/highlights';
import { HighlightsPage } from '@dailydotdev/shared/src/components/highlights/HighlightsPage';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const HIGHLIGHTS_TITLE = 'Highlights | daily.dev';
const HIGHLIGHTS_DESCRIPTION =
  'Curated highlights from across the developer ecosystem. Stay on top of the most important stories, releases, and discussions.';

const HighlightsPageWrapper = (): ReactElement => <HighlightsPage />;

const getHighlightsLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

HighlightsPageWrapper.getLayout = getHighlightsLayout;
HighlightsPageWrapper.layoutProps = {
  screenCentered: false,
  seo: {
    title: HIGHLIGHTS_TITLE,
    description: HIGHLIGHTS_DESCRIPTION,
    canonical: 'https://app.daily.dev/highlights',
    openGraph: {
      ...defaultOpenGraph,
      title: HIGHLIGHTS_TITLE,
      description: HIGHLIGHTS_DESCRIPTION,
      url: 'https://app.daily.dev/highlights',
      type: 'website',
    },
    ...defaultSeo,
  },
};

export default HighlightsPageWrapper;

interface HighlightsPageProps {
  dehydratedState: DehydratedState;
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<HighlightsPageProps>
> {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(highlightsPageQueryOptions());

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 60,
  };
}
