import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ReactElement } from 'react';
import React from 'react';
import type { DehydratedState } from '@tanstack/react-query';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import type { NextSeoProps } from 'next-seo/lib/types';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import {
  ExplorePageContent,
  prefetchExplorePageData,
} from '../../components/explore/ExplorePageContent';
import type { ExploreCategoryId } from '../../components/explore/exploreCategories';
import {
  EXPLORE_CATEGORIES,
  getExploreCategoryById,
} from '../../components/explore/exploreCategories';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

interface ExploreCategoryPageProps {
  activeCategoryId: ExploreCategoryId;
  dehydratedState: DehydratedState;
}

const seoTitles = getPageSeoTitles('Explore developer news');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: {
    ...defaultOpenGraph,
    ...seoTitles.openGraph,
  },
  description:
    'Scan happening now updates, latest stories, and top developer news in one place on daily.dev.',
};

const ExploreCategoryPage = ({
  activeCategoryId,
}: ExploreCategoryPageProps): ReactElement => (
  <ExplorePageContent activeCategoryId={activeCategoryId} />
);

const getExploreLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ExploreCategoryPage.getLayout = getExploreLayout;
ExploreCategoryPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default ExploreCategoryPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const paths = EXPLORE_CATEGORIES.filter(
    (category) => category.id !== 'explore',
  ).map((category) => ({
    params: { category: category.id },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(
  context: GetStaticPropsContext<{ category: string }>,
): Promise<GetStaticPropsResult<ExploreCategoryPageProps>> {
  const categoryParam = context.params?.category;
  const category = getExploreCategoryById(categoryParam);

  if (!category || category.id === 'explore') {
    return {
      notFound: true,
    };
  }

  const queryClient = new QueryClient();
  await prefetchExplorePageData({
    queryClient,
    categoryId: category.id,
  });

  return {
    props: {
      activeCategoryId: category.id,
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 600,
  };
}
