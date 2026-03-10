import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import Head from 'next/head';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, { useContext, useMemo } from 'react';
import type { NextSeoProps } from 'next-seo/lib/types';
import Feed from '@dailydotdev/shared/src/components/Feed';
import {
  baseFeedSupportedTypes,
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SOURCE_FEED_QUERY,
  SOURCE_TOP_POSTS_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import type {
  TopPost,
  TopPostsData,
} from '@dailydotdev/shared/src/graphql/feed';
import type {
  Source,
  SourceData,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  isSourceUserSource,
  SIMILAR_SOURCES_QUERY,
  SOURCE_QUERY,
  SOURCE_RELATED_TAGS_QUERY,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';

import { PageInfoHeader } from '@dailydotdev/shared/src/components/utilities';
import {
  DiscussIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import type { Connection } from '@dailydotdev/shared/src/graphql/common';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  OtherFeedPage,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import {
  useFeedLayout,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useQuery } from '@tanstack/react-query';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { RecommendedTags } from '@dailydotdev/shared/src/components/RecommendedTags';
import { RelatedSources } from '@dailydotdev/shared/src/components/RelatedSources';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import { AuthenticationBanner } from '@dailydotdev/shared/src/components/auth';
import { useOnboardingActions } from '@dailydotdev/shared/src/hooks/auth';
import HorizontalFeed from '@dailydotdev/shared/src/components/feeds/HorizontalFeed';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import type { GraphQLError } from '@dailydotdev/shared/src/lib/errors';
import Custom404 from '../404';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';
import { getPageSeoTitles } from '../../components/layouts/utils';
import { SourceActions } from '../../../shared/src/components/sources/SourceActions';
import type { DynamicSeoProps } from '../../components/common';
import { getAppOrigin } from '../../lib/seo';

const appOrigin = getAppOrigin();

interface SourcePageProps extends DynamicSeoProps {
  source?: Source;
  relatedTags?: TagsData['tags'];
  topPosts?: TopPost[];
}
type SourceIdProps = { sourceId?: string };

const SourceRelatedTags = ({
  sourceId,
  initialTags = [],
}: SourceIdProps & {
  initialTags?: TagsData['tags'];
}): ReactElement => {
  const { data: relatedTags, isPending } = useQuery({
    queryKey: [RequestKey.SourceRelatedTags, null, sourceId],

    queryFn: async () =>
      await gqlClient.request<{
        relatedTags: TagsData;
      }>(SOURCE_RELATED_TAGS_QUERY, {
        sourceId,
      }),
    enabled: !!sourceId,
    staleTime: StaleTime.OneHour,
  });

  return (
    <RecommendedTags
      isLoading={isPending && initialTags.length === 0}
      tags={relatedTags?.relatedTags?.tags ?? initialTags}
    />
  );
};

const SimilarSources = ({ sourceId }: SourceIdProps) => {
  const { data: similarSources, isPending } = useQuery({
    queryKey: [RequestKey.SimilarSources, null, sourceId],

    queryFn: async () =>
      await gqlClient.request<{ similarSources: Connection<Source> }>(
        SIMILAR_SOURCES_QUERY,
        {
          sourceId,
          first: 6,
        },
      ),

    enabled: !!sourceId,
    staleTime: StaleTime.OneHour,
  });

  const sources = similarSources?.similarSources?.edges?.map(
    (edge) => edge.node,
  );

  return (
    <RelatedSources
      isLoading={isPending}
      sources={sources}
      title="Similar sources"
      className="mx-4"
    />
  );
};

const getSourcePageJsonLd = (source: Source): string => {
  const sourceHandle = source.handle || source.id;
  const sourcePageUrl = `${appOrigin}/sources/${encodeURIComponent(
    sourceHandle,
  )}`;
  const sourceUrl = source.permalink || sourcePageUrl;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${sourcePageUrl}#organization`,
        name: source.name,
        url: sourceUrl,
        ...(source.image && {
          logo: { '@type': 'ImageObject', url: source.image },
        }),
        ...(source.description && { description: source.description }),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${sourcePageUrl}#page`,
        url: sourcePageUrl,
        name: `${source.name} posts on daily.dev`,
        ...(source.description && { description: source.description }),
        about: { '@id': `${sourcePageUrl}#organization` },
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
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
            name: 'Sources',
            item: `${appOrigin}/sources`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: source.name,
          },
        ],
      },
    ],
  });
};

const SourcePage = ({
  source,
  relatedTags = [],
  topPosts = [],
}: SourcePageProps): ReactElement => {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { shouldShowAuthBanner } = useOnboardingActions();
  const shouldShowTagSourceSocialProof = shouldShowAuthBanner && isLaptop;
  const { user } = useContext(AuthContext);
  const mostUpvotedQueryVariables = useMemo(
    () => ({
      source: source?.id,
      supportedTypes: [
        PostType.Article,
        PostType.SocialTwitter,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
      period: 30,
    }),
    [source?.id],
  );
  const bestDiscussedQueryVariables = useMemo(
    () => ({
      source: source?.id,
    }),
    [source?.id],
  );
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      source: source?.id,
      ranking: 'TIME',
      supportedTypes: baseFeedSupportedTypes,
    }),
    [source?.id],
  );
  const { FeedPageLayoutComponent } = useFeedLayout();

  if (!source) {
    return <Custom404 />;
  }

  const jsonLd = getSourcePageJsonLd(source);

  return (
    <FeedPageLayoutComponent className="overflow-x-hidden">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      </Head>
      <PageInfoHeader className="mx-4 !w-auto">
        <div className="flex items-center font-bold">
          <img
            src={source.image}
            alt={`${source.name} logo`}
            className="size-10 rounded-full"
          />
          <h1 className="ml-2 w-fit typo-title2">{source.name}</h1>
        </div>
        <div className="flex flex-row gap-3">
          <SourceActions source={source} />
        </div>
        {source?.description && (
          <p className="typo-body">{source?.description}</p>
        )}
        <SourceRelatedTags sourceId={source.id} initialTags={relatedTags} />
      </PageInfoHeader>
      <SimilarSources sourceId={source.id} />
      {relatedTags.length > 0 && (
        <div className="sr-only">
          {relatedTags
            .map((tag) => tag.name)
            .filter((tag): tag is string => !!tag)
            .map((tag) => (
              <Link key={tag} href={`/tags/${tag}`} prefetch={false}>
                <a>Posts about {tag}</a>
              </Link>
            ))}
        </div>
      )}
      {topPosts.length > 0 && (
        <div className="sr-only">
          {topPosts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug || post.id}`}
              prefetch={false}
            >
              <a>{post.title}</a>
            </Link>
          ))}
        </div>
      )}
      <ActiveFeedNameContext.Provider
        value={{ feedName: OtherFeedPage.SourceMostUpvoted }}
      >
        <HorizontalFeed
          feedName={OtherFeedPage.SourceMostUpvoted}
          feedQueryKey={[
            'sourceMostUpvoted',
            user?.id ?? 'anonymous',
            Object.values(mostUpvotedQueryVariables),
          ]}
          query={MOST_UPVOTED_FEED_QUERY}
          variables={mostUpvotedQueryVariables}
          title={{
            copy: 'Most upvoted posts',
            icon: <UpvoteIcon size={IconSize.Medium} className="mr-1.5" />,
          }}
          className="laptop:!mx-4"
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
      <ActiveFeedNameContext.Provider
        value={{ feedName: OtherFeedPage.SourceBestDiscussed }}
      >
        <HorizontalFeed
          feedName={OtherFeedPage.SourceBestDiscussed}
          feedQueryKey={[
            'sourceBestDiscussed',
            user?.id ?? 'anonymous',
            Object.values(bestDiscussedQueryVariables),
          ]}
          query={MOST_DISCUSSED_FEED_QUERY}
          variables={bestDiscussedQueryVariables}
          title={{
            copy: 'Best discussed posts',
            icon: <DiscussIcon size={IconSize.Medium} className="mr-1.5" />,
          }}
          className="laptop:!mx-4"
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
      <div className="mx-4 mb-5 flex w-auto items-center">
        <p className="flex items-center font-bold typo-body">
          All posts from {source.name}
        </p>
      </div>
      <Feed
        feedName={OtherFeedPage.Squad}
        feedQueryKey={[
          'sourceFeed',
          user?.id ?? 'anonymous',
          Object.values(queryVariables),
        ]}
        query={SOURCE_FEED_QUERY}
        variables={queryVariables}
        className="!mx-4 !w-auto"
      />
      {shouldShowTagSourceSocialProof && <AuthenticationBanner />}
    </FeedPageLayoutComponent>
  );
};

SourcePage.getLayout = getLayout;
SourcePage.layoutProps = {
  ...mainFeedLayoutProps,
  customBanner: <CustomAuthBanner />,
};
export default SourcePage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

interface SourcePageParams extends ParsedUrlQuery {
  source: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<SourcePageParams>): Promise<
  GetStaticPropsResult<SourcePageProps>
> {
  try {
    const res = await gqlClient.request<SourceData>(SOURCE_QUERY, {
      id: params?.source,
    });

    if (isSourceUserSource(res.source)) {
      return {
        redirect: {
          destination: `/${res.source.id}`,
          permanent: false,
        },
      };
    }

    if (res.source?.type === SourceType.Squad) {
      return {
        redirect: {
          destination: `/squads/${params?.source}`,
          permanent: false,
        },
      };
    }

    const { source } = res;
    const [relatedTagsResult, sourceTopPostsResult] = await Promise.all([
      gqlClient
        .request<{ relatedTags: TagsData }>(SOURCE_RELATED_TAGS_QUERY, {
          sourceId: source.id,
        })
        .catch(() => null),
      gqlClient
        .request<TopPostsData>(SOURCE_TOP_POSTS_QUERY, {
          source: source.id,
          first: 10,
        })
        .catch(() => null),
    ]);
    const relatedTags = relatedTagsResult?.relatedTags?.tags ?? [];
    const topPosts =
      sourceTopPostsResult?.page?.edges
        ?.map((edge) => edge.node)
        .filter((post) => !!post.title) ?? [];
    const seoTitles = getPageSeoTitles(`${source.name} posts`);
    const seo: NextSeoProps = {
      ...defaultSeo,
      ...seoTitles,
      openGraph: {
        ...defaultOpenGraph,
        ...seoTitles.openGraph,
      },
      description: source?.description || defaultSeo.description,
    };

    return {
      props: {
        source: res.source,
        relatedTags,
        topPosts,
        seo,
      },
      revalidate: 3600,
    };
  } catch (err) {
    const error = err as GraphQLError;
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        error?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        notFound: true,
        revalidate: 3600,
      };
    }
    throw err;
  }
}
