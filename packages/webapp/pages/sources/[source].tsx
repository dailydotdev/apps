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
import { SOURCE_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import {
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
import {
  FeedPage,
  PageInfoHeader,
} from '@dailydotdev/shared/src/components/utilities';
import { PlusIcon, BlockIcon } from '@dailydotdev/shared/src/components/icons';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import {
  OtherFeedPage,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { SourceSubscribeButton } from '@dailydotdev/shared/src/components';
import { useQuery } from '@tanstack/react-query';
import type { TagsData } from '@dailydotdev/shared/src/graphql/feedSettings';
import { RecommendedTags } from '@dailydotdev/shared/src/components/RecommendedTags';
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

const SourcePage = ({ source }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin } = useContext(AuthContext);
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
    <FeedPage>
      <NextSeo {...seo} />
      <PageInfoHeader>
        <div className="flex items-center font-bold">
          <img
            src={source.image}
            alt={`${source.name} logo`}
            className="size-10 rounded-full"
          />
          <h1 className="ml-2 typo-title2">{source.name}</h1>
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
    </FeedPage>
  );
};

SourcePage.getLayout = getLayout;
SourcePage.layoutProps = mainFeedLayoutProps;

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
