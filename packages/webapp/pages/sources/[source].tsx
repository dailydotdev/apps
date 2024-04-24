import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import {
  MOST_DISCUSSED_FEED_QUERY,
  MOST_UPVOTED_FEED_QUERY,
  SOURCE_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import {
  SIMILAR_SOURCES_QUERY,
  Source,
  SOURCE_QUERY,
  SOURCE_RELATED_TAGS_QUERY,
  SourceData,
} from '@dailydotdev/shared/src/graphql/sources';
import request from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { PageInfoHeader } from '@dailydotdev/shared/src/components/utilities';
import {
  BlockIcon,
  DiscussIcon,
  PlusIcon,
  UpvoteIcon,
} from '@dailydotdev/shared/src/components/icons';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { ApiError, Connection } from '@dailydotdev/shared/src/graphql/common';
import {
  OtherFeedPage,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { SourceSubscribeButton } from '@dailydotdev/shared/src/components';
import {
  useFeedLayout,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useQuery } from '@tanstack/react-query';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { RecommendedTags } from '@dailydotdev/shared/src/components/RecommendedTags';
import { RelatedSources } from '@dailydotdev/shared/src/components/RelatedSources';
import { TagSourceCustomAuthBannerExperiment } from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { AuthenticationBanner } from '@dailydotdev/shared/src/components/auth';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth';
import { useFeature } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { TagSourceSocialProof } from '@dailydotdev/shared/src/lib/featureValues';
import HorizontalFeed from '@dailydotdev/shared/src/components/feeds/HorizontalFeed';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ActiveFeedNameContext } from '@dailydotdev/shared/src/contexts/ActiveFeedNameContext';
import Custom404 from '../404';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';

type SourcePageProps = { source: Source };

const SourceRelatedTags = ({
  sourceId,
}: {
  sourceId: string;
}): ReactElement => {
  const { data: relatedTags, isLoading } = useQuery(
    [RequestKey.SourceRelatedTags, null, sourceId],
    async () =>
      await request<{
        relatedTags: TagsData;
      }>(graphqlUrl, SOURCE_RELATED_TAGS_QUERY, {
        sourceId,
      }),
    {
      enabled: !!sourceId,
      staleTime: StaleTime.OneHour,
    },
  );

  return (
    <RecommendedTags
      isLoading={isLoading}
      tags={relatedTags?.relatedTags?.tags}
    />
  );
};

const SimilarSources = ({ sourceId }: { sourceId: string }) => {
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const { data: similarSources, isLoading } = useQuery(
    [RequestKey.SimilarSources, null, sourceId],
    async () =>
      await request<{ similarSources: Connection<Source> }>(
        graphqlUrl,
        SIMILAR_SOURCES_QUERY,
        {
          sourceId,
          first: 6,
        },
      ),
    {
      enabled: !!sourceId,
      staleTime: StaleTime.OneHour,
    },
  );

  const sources = similarSources?.similarSources?.edges?.map(
    (edge) => edge.node,
  );

  return (
    <RelatedSources
      isLoading={isLoading}
      sources={sources}
      title="Similar sources"
      className={shouldUseMobileFeedLayout && 'mx-4'}
    />
  );
};

const SourcePage = ({ source }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { shouldShowAuthBanner } = useOnboarding();
  const tagSourceFeatureValue = useFeature(feature.tagSourceSocialProof);
  const shouldShowTagSourceSocialProof =
    shouldShowAuthBanner &&
    tagSourceFeatureValue === TagSourceSocialProof.V1 &&
    isLaptop;
  const { user, showLogin } = useContext(AuthContext);
  const mostUpvotedQueryVariables = useMemo(
    () => ({
      source: source?.id,
      supportedTypes: [
        PostType.Article,
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
      supportedTypes: [
        PostType.Article,
        PostType.VideoYouTube,
        PostType.Collection,
      ],
    }),
    [source?.id],
  );
  const { shouldUseMobileFeedLayout, FeedPageLayoutComponent } =
    useFeedLayout();
  const { feedSettings } = useFeedSettings();
  const { onFollowSource, onUnfollowSource } = useTagAndSource({
    origin: Origin.SourcePage,
  });

  const unfollowingSource = useMemo(() => {
    if (!feedSettings) {
      return true;
    }
    return (
      feedSettings.excludeSources?.findIndex(
        (excludedSource) => source?.id === excludedSource.id,
      ) >= 0
    );
  }, [feedSettings, source]);

  if (!isFallback && !source) {
    return <Custom404 />;
  }

  if (isFallback || !source) {
    return <></>;
  }

  const seo: NextSeoProps = {
    title: `${source.name} posts on daily.dev`,
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
    description: source?.description || defaultSeo.description,
  };

  const buttonProps: ButtonProps<'button'> = {
    size: ButtonSize.Small,
    icon: unfollowingSource ? <PlusIcon /> : <BlockIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (unfollowingSource) {
          await onFollowSource({ source });
        } else {
          await onUnfollowSource({ source });
        }
      } else {
        showLogin({ trigger: AuthTriggers.Filter });
      }
    },
    variant: ButtonVariant.Float,
  };

  return (
    <FeedPageLayoutComponent className="overflow-x-hidden">
      <NextSeo {...seo} />
      <PageInfoHeader className={shouldUseMobileFeedLayout && 'mx-4 !w-auto'}>
        <div className="flex items-center font-bold">
          <img
            src={source.image}
            alt={`${source.name} logo`}
            className="size-10 rounded-full"
          />
          <h1 className="ml-2 w-fit typo-title2">{source.name}</h1>
        </div>
        <div className="flex flex-row gap-3">
          {!unfollowingSource && <SourceSubscribeButton source={source} />}
          <Button
            {...buttonProps}
            aria-label={unfollowingSource ? 'Follow' : 'Block'}
          >
            {unfollowingSource ? 'Follow' : 'Block'}
          </Button>
        </div>
        {source?.description && (
          <p className="typo-body">{source?.description}</p>
        )}
        <SourceRelatedTags sourceId={source.id} />
      </PageInfoHeader>
      <SimilarSources sourceId={source.id} />
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
          title={
            <>
              <UpvoteIcon size={IconSize.Medium} className="mr-1.5" /> Most
              upvoted posts
            </>
          }
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
          title={
            <>
              <DiscussIcon size={IconSize.Medium} className="mr-1.5" /> Best
              discussed posts
            </>
          }
          emptyScreen={<></>}
        />
      </ActiveFeedNameContext.Provider>
      <div className="mx-4 mb-5 flex w-auto items-center laptop:mx-0 laptop:w-full">
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
      />
      {shouldShowTagSourceSocialProof && <AuthenticationBanner />}
    </FeedPageLayoutComponent>
  );
};

SourcePage.getLayout = getLayout;
SourcePage.layoutProps = {
  ...mainFeedLayoutProps,
  customBanner: <TagSourceCustomAuthBannerExperiment />,
};
export default SourcePage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
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
    const res = await request<SourceData>(graphqlUrl, SOURCE_QUERY, {
      id: params.source,
    });

    if (res.source?.type === 'squad') {
      return {
        redirect: {
          destination: `/squads/${params.source}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        source: res.source,
      },
      revalidate: 60,
    };
  } catch (err) {
    if (
      [ApiError.NotFound, ApiError.Forbidden].includes(
        err?.response?.errors?.[0]?.extensions?.code,
      )
    ) {
      return {
        props: {
          source: null,
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
