import type { GetStaticPropsResult } from 'next';
import type { NextSeoProps } from 'next-seo';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { KEYWORD_QUERY } from '@dailydotdev/shared/src/graphql/keywords';
import type {
  TopPost,
  TopPostsData,
} from '@dailydotdev/shared/src/graphql/feed';
import { TAG_TOP_POSTS_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { GET_RECOMMENDED_TAGS_QUERY } from '@dailydotdev/shared/src/graphql/feedSettings';
import { TOP_CREATORS_BY_TAG_QUERY } from '@dailydotdev/shared/src/graphql/users';
import type { UserShortProfile } from '@dailydotdev/shared/src/lib/user';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { getPageSeoTitles } from '../components/layouts/utils';
import { defaultOpenGraph, defaultSeo } from '../next-seo';
import { getAppOrigin } from './seo';

const appOrigin = getAppOrigin();

export interface TopicPageProps {
  tag: string;
  initialData: Keyword | null;
  topPosts: TopPost[];
  recommendedTags: TagsData['tags'];
  topContributors: UserShortProfile[];
  seo: NextSeoProps;
}

export const getTopicSeoData = (
  tag: string,
  title: string,
  description = `Find all the recent posts, videos, updates and discussions about ${title}`,
): NextSeoProps => {
  const seoTitles = getPageSeoTitles(`${title} posts`);
  // Both /tags/[tag] and /explore/[tag] render this surface; point the canonical
  // at the Explore route so search engines don't see duplicate content.
  const canonical = `${appOrigin}/explore/${encodeURIComponent(tag)}`;

  return {
    ...defaultSeo,
    ...seoTitles,
    canonical,
    openGraph: {
      ...defaultOpenGraph,
      ...seoTitles.openGraph,
      url: canonical,
    },
    description,
  };
};

// Shared data-fetch for both /tags/[tag] and /explore/[tag]. `basePath` only
// affects the breadcrumb/canonical URL used in the JSON-LD.
export const getTopicPageStaticProps = async (
  tag: string | undefined,
): Promise<GetStaticPropsResult<TopicPageProps>> => {
  if (!tag) {
    return { notFound: true, revalidate: 3600 };
  }

  const notFoundResponse: GetStaticPropsResult<TopicPageProps> = {
    revalidate: 3600,
    props: {
      tag,
      initialData: null,
      topPosts: [],
      recommendedTags: [],
      topContributors: [],
      seo: getTopicSeoData(tag, tag),
    },
  };

  try {
    const [
      keywordResult,
      topPostsResult,
      recommendedTagsResult,
      topContributorsResult,
    ] = await Promise.all([
      gqlClient.request<{ keyword: Keyword }>(KEYWORD_QUERY, { value: tag }),
      gqlClient
        .request<TopPostsData>(TAG_TOP_POSTS_QUERY, { tag, first: 10 })
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
          { tag, limit: 6 },
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
    const seo = getTopicSeoData(
      tag,
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
    return notFoundResponse;
  }
};

export const getTopicPageJsonLd = ({
  tag,
  initialData,
  topPosts,
  basePath,
}: {
  tag: string;
  initialData: Keyword;
  topPosts: TopPost[];
  basePath: 'tags' | 'explore';
}): string => {
  const encodedTag = encodeURIComponent(tag);
  const tagTitle = initialData.flags?.title || tag;
  const tagDescription =
    initialData.flags?.description ||
    `Find all the recent posts, videos, updates and discussions about ${tagTitle}`;
  const tagUrl = `${appOrigin}/${basePath}/${encodedTag}`;
  const breadcrumbLabel = basePath === 'explore' ? 'Explore' : 'Tags';

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
          { '@type': 'ListItem', position: 1, name: 'Home', item: appOrigin },
          {
            '@type': 'ListItem',
            position: 2,
            name: breadcrumbLabel,
            item: `${appOrigin}/${basePath}`,
          },
          { '@type': 'ListItem', position: 3, name: tagTitle },
        ],
      },
    ],
  });
};
