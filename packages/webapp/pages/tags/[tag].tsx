import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React from 'react';
import type { NextSeoProps } from 'next-seo';
import type {
  TopPost,
  TopPostsData,
} from '@dailydotdev/shared/src/graphql/feed';
import { TAG_TOP_POSTS_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { GET_RECOMMENDED_TAGS_QUERY } from '@dailydotdev/shared/src/graphql/feedSettings';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { TOP_CREATORS_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/users';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { TagTopicPage } from '@dailydotdev/shared/src/components/tags/TagTopicPage';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import type { DynamicSeoProps } from '../../components/common';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { getAppOrigin } from '../../lib/seo';

const appOrigin = getAppOrigin();

interface TagPageProps extends DynamicSeoProps {
  tag: string;
  initialData: Keyword | null;
  topPosts: TopPost[];
  recommendedTags: TagsData['tags'];
  topContributors: UserShortProfile[];
}

const getTagPageJsonLd = ({
  tag,
  initialData,
  topPosts,
}: {
  tag: string;
  initialData: Keyword;
  topPosts: TopPost[];
}): string => {
  const encodedTag = encodeURIComponent(tag);
  const tagTitle = initialData.flags?.title || tag;
  const tagDescription =
    initialData.flags?.description ||
    `Find all the recent posts, videos, updates and discussions about ${tagTitle}`;
  const tagUrl = `${appOrigin}/tags/${encodedTag}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${tagUrl}#page`,
        url: tagUrl,
        name: `${tagTitle} posts on daily.dev`,
        description: tagDescription,
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      ...(topPosts.length
        ? [
            {
              '@type': 'ItemList',
              '@id': `${tagUrl}#items`,
              numberOfItems: topPosts.length,
              itemListElement: topPosts.map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appOrigin}/posts/${post.slug || post.id}`,
                name: post.title || '',
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: appOrigin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tags',
            item: `${appOrigin}/tags`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tagTitle,
          },
        ],
      },
    ],
  });
};

const TagPage = ({
  tag,
  initialData,
  topPosts,
  recommendedTags,
  topContributors,
}: TagPageProps): ReactElement => {
  const jsonLd = initialData
    ? getTagPageJsonLd({ tag, initialData, topPosts })
    : null;

  return (
    <TagTopicPage
      tag={tag}
      initialData={initialData}
      topPosts={topPosts}
      recommendedTags={recommendedTags}
      topContributors={topContributors}
      jsonLd={jsonLd}
    />
  );
};

TagPage.getLayout = getLayout;
TagPage.layoutProps = mainFeedLayoutProps;

export default TagPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface TagPageParams extends ParsedUrlQuery {
  tag: string;
}

const getSeoData = (
  title: string,
  description = `Find all the recent posts, videos, updates and discussions about ${title}`,
): NextSeoProps => {
  const seoTitles = getPageSeoTitles(`${title} posts`);

  return {
    ...defaultSeo,
    ...seoTitles,
    openGraph: {
      ...defaultOpenGraph,
      ...seoTitles.openGraph,
    },
    description,
  };
};

export async function getStaticProps({
  params,
}: GetStaticPropsContext<TagPageParams>): Promise<
  GetStaticPropsResult<TagPageProps>
> {
  const tag = params?.tag;
  if (!tag) {
    return { notFound: true, revalidate: 3600 };
  }

  const notFoundResponse = {
    revalidate: 3600,
    props: {
      tag,
      initialData: null,
      topPosts: [],
      recommendedTags: [],
      topContributors: [],
      seo: getSeoData(tag),
    },
  };

  try {
    const [
      keywordResult,
      topPostsResult,
      recommendedTagsResult,
      topContributorsResult,
    ] = await Promise.all([
      gqlClient.request<{ keyword: Keyword }>(KEYWORD_QUERY, {
        value: tag,
      }),
      gqlClient
        .request<TopPostsData>(TAG_TOP_POSTS_QUERY, {
          tag,
          first: 10,
        })
        .catch(() => null),
      gqlClient
        .request<{ recommendedTags: TagsData }>(GET_RECOMMENDED_TAGS_QUERY, {
          tags: [tag],
          excludedTags: [],
        })
        .catch(() => null),
      gqlClient
        .request<{ topCreatorsByTag: UserShortProfile[] }>(
          TOP_CREATORS_BY_TAG_QUERY,
          {
            tag,
            limit: 6,
          },
        )
        .catch(() => null),
    ]);

    if (!keywordResult?.keyword) {
      return notFoundResponse;
    }

    const initialData = keywordResult.keyword;
    const topPosts =
      topPostsResult?.page?.edges
        ?.map((edge) => edge.node)
        .filter((post) => !!post.title) ?? [];
    const recommendedTags = recommendedTagsResult?.recommendedTags?.tags ?? [];
    const topContributors = topContributorsResult?.topCreatorsByTag ?? [];
    const seo = getSeoData(
      initialData.flags?.title || tag,
      initialData.flags?.description,
    );

    return {
      props: {
        seo,
        initialData,
        tag,
        topPosts,
        recommendedTags,
        topContributors,
      },
      revalidate: 3600,
    };
  } catch (error) {
    // Return fallback props for any request failure in getStaticProps.
    return notFoundResponse;
  }
}
