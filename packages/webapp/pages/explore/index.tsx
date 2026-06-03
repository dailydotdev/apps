import type { ReactElement } from 'react';
import React, { useEffect } from 'react';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo/lib/types';
import { useRouter } from 'next/router';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { TAG_DIRECTORY_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import type { TagCategory } from '@dailydotdev/shared/src/graphql/feedSettings';
import { TAGS_CATEGORIES_QUERY } from '@dailydotdev/shared/src/graphql/feedSettings';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { ExploreTopicsPage } from '@dailydotdev/shared/src/components/explore/ExploreTopicsPage';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { featureExploreTopics } from '@dailydotdev/shared/src/lib/featureManagement';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getAppOrigin } from '../../lib/seo';

const exploreCanonical = `${getAppOrigin()}/tags`;
const seoTitles = getPageSeoTitles('Explore topics for developers');
const seo: NextSeoProps = {
  title: seoTitles.title,
  canonical: exploreCanonical,
  openGraph: {
    ...seoTitles.openGraph,
    ...defaultOpenGraph,
    url: exploreCanonical,
  },
  description:
    'Explore topics on daily.dev. Search, browse by category, and follow the topics that matter to developers.',
};

interface ExplorePageProps {
  tags: Keyword[];
  trendingTags: Keyword[];
  popularTags: Keyword[];
  tagsCategories: TagCategory[];
}

const getExploreSchema = (tags: Keyword[]): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://app.daily.dev/explore#collection',
        url: 'https://app.daily.dev/explore',
        name: 'Explore topics for developers',
        description: 'Explore topics on daily.dev.',
      },
      {
        '@type': 'ItemList',
        '@id': 'https://app.daily.dev/explore#items',
        itemListElement: tags.map((tag, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: tag.value,
            url: `https://app.daily.dev/explore/${encodeURIComponent(
              tag.value,
            )}`,
          },
        })),
      },
    ],
  });

const ExplorePage = ({
  tags,
  trendingTags,
  popularTags,
  tagsCategories,
}: ExplorePageProps): ReactElement => {
  const router = useRouter();
  const isExplore = useFeature(featureExploreTopics);

  // When the experiment is off, the lobby lives at /tags — send visitors there.
  useEffect(() => {
    if (!isExplore) {
      router.replace(`${webappUrl}tags`);
    }
  }, [isExplore, router]);

  if (!isExplore || router.isFallback) {
    return <></>;
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: getExploreSchema(tags.slice(0, 50)),
          }}
        />
      </Head>
      <ExploreTopicsPage
        tags={tags}
        trendingTags={trendingTags}
        popularTags={popularTags}
        tagsCategories={tagsCategories}
      />
    </>
  );
};

const getExplorePageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

ExplorePage.getLayout = getExplorePageLayout;
ExplorePage.layoutProps = {
  screenCentered: false,
  seo,
};

export default ExplorePage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<ExplorePageProps>
> {
  try {
    const [directory, categories] = await Promise.all([
      gqlClient.request<{
        tags: Keyword[];
        trendingTags: Keyword[];
        popularTags: Keyword[];
      }>(TAG_DIRECTORY_QUERY),
      gqlClient
        .request<{ tagsCategories: TagCategory[] }>(TAGS_CATEGORIES_QUERY)
        .catch(() => null),
    ]);

    return {
      props: {
        tags: directory.tags,
        trendingTags: directory.trendingTags,
        popularTags: directory.popularTags,
        tagsCategories: categories?.tagsCategories ?? [],
      },
      revalidate: 60,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          tags: [],
          trendingTags: [],
          popularTags: [],
          tagsCategories: [],
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
