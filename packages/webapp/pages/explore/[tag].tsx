import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import {
  getMainFeedLayout,
  mainFeedLayoutProps,
} from '../../components/layouts/MainFeedPage';
import type { DynamicSeoProps } from '../../components/common';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

interface ExploreTagPageProps extends DynamicSeoProps {
  tag: string;
}

interface ExploreTagPageParams extends ParsedUrlQuery {
  tag: string;
}

const ExploreTagPage = (): ReactElement => <></>;

ExploreTagPage.getLayout = getMainFeedLayout;
ExploreTagPage.layoutProps = mainFeedLayoutProps;

export default ExploreTagPage;

const getSeoData = (tag: string): NextSeoProps => {
  const seoTitles = getPageSeoTitles(`#${tag} feed`);
  return {
    ...defaultSeo,
    ...seoTitles,
    openGraph: {
      ...defaultOpenGraph,
      ...seoTitles.openGraph,
    },
    description: `Explore #${tag} on daily.dev`,
  };
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<ExploreTagPageParams>): Promise<
  GetStaticPropsResult<ExploreTagPageProps>
> {
  const tag = params?.tag;
  if (!tag) {
    return { notFound: true, revalidate: 3600 };
  }
  return {
    props: {
      tag,
      seo: getSeoData(tag),
    },
    revalidate: 3600,
  };
}
