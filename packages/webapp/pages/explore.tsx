import type { GetStaticPropsResult } from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getLayout as getFooterNavBarLayout } from '../components/layouts/FooterNavBarLayout';
import { getLayout } from '../components/layouts/MainLayout';
import {
  ExplorePageContent,
  prefetchExplorePageData,
} from '../components/explore/ExplorePageContent';
import { defaultOpenGraph } from '../next-seo';
import { getPageSeoTitles } from '../components/layouts/utils';

interface ExplorePageProps {
  dehydratedState: DehydratedState;
}

const seoTitles = getPageSeoTitles('Explore developer news');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: {
    ...defaultOpenGraph,
    ...seoTitles.openGraph,
    url: 'https://app.daily.dev/explore',
  },
  description:
    'Scan happening now updates, latest stories, and top developer news in one place on daily.dev.',
  canonical: 'https://app.daily.dev/explore',
};

const ExplorePage = (): ReactElement => (
  <ExplorePageContent activeCategoryId="explore" />
);

const getExploreLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ExplorePage.getLayout = getExploreLayout;
ExplorePage.layoutProps = {
  screenCentered: false,
  seo,
};

export default ExplorePage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<ExplorePageProps>
> {
  const queryClient = new QueryClient();
  await prefetchExplorePageData({ queryClient, categoryId: 'explore' });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 600,
  };
}
