import type { ReactElement } from 'react';
import React from 'react';
import type { GetStaticPropsResult } from 'next';
import Head from 'next/head';
import type { NextSeoProps } from 'next-seo/lib/types';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { TAG_DIRECTORY_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { useRouter } from 'next/router';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import { TagsDirectoryPage } from '@dailydotdev/shared/src/components/tags/TagsDirectoryPage';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph } from '../../next-seo';
import { getPageSeoTitles } from '../../components/layouts/utils';

const seoTitles = getPageSeoTitles('Explore trending tags for developers');
const seo: NextSeoProps = {
  title: seoTitles.title,
  openGraph: { ...seoTitles.openGraph, ...defaultOpenGraph },
  description:
    'Discover trending, popular, and new tags on daily.dev. Browse topics that matter to developers and find relevant content quickly.',
};

interface TagsPageProps {
  tags: Keyword[];
  trendingTags: Keyword[];
  popularTags: Keyword[];
}

const getTagsSchemas = (tags: Keyword[]): string =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://daily.dev/tags#collection',
        url: 'https://daily.dev/tags',
        name: 'Explore trending tags for developers',
        description: 'Discover trending, popular, and new tags on daily.dev.',
      },
      {
        '@type': 'ItemList',
        '@id': 'https://daily.dev/tags#items',
        itemListElement: tags.map((tag, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: tag.value,
            url: `https://daily.dev/tags/${encodeURIComponent(tag.value)}`,
          },
        })),
      },
    ],
  });

const TagsPage = ({
  tags,
  trendingTags,
  popularTags,
}: TagsPageProps): ReactElement => {
  const { isFallback: isLoading } = useRouter();

  if (isLoading) {
    return <></>;
  }

  const topTagsForSchema = tags.slice(0, 50);

  return (
    <>
      {/* No page-header title here — the TagPageNavbar tabs (rendered by
          TagsDirectoryPage) are the header for the tags directory. */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: getTagsSchemas(topTagsForSchema),
          }}
        />
      </Head>
      <TagsDirectoryPage
        tags={tags}
        trendingTags={trendingTags}
        popularTags={popularTags}
      />
    </>
  );
};

const getTagsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TagsPage.getLayout = getTagsPageLayout;
TagsPage.layoutProps = {
  screenCentered: false,
  seo,
};
export default TagsPage;

export async function getStaticProps(): Promise<
  GetStaticPropsResult<TagsPageProps>
> {
  try {
    const res = await gqlClient.request<TagsPageProps>(TAG_DIRECTORY_QUERY);
    return {
      props: {
        tags: res.tags,
        trendingTags: res.trendingTags,
        popularTags: res.popularTags,
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
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
