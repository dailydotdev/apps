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
  CustomFeedHeader,
  FeedPage,
} from '@dailydotdev/shared/src/components/utilities';
import { PlusIcon, BlockIcon } from '@dailydotdev/shared/src/components/icons';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { Origin } from '@dailydotdev/shared/src/lib/analytics';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import { SourceSubscribeButton } from '@dailydotdev/shared/src/components';
import Custom404 from '../404';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';

type SourcePageProps = { source: Source };

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
      <CustomFeedHeader>
        <img
          src={source.image}
          alt={`${source.name} logo`}
          className="mr-2 h-6 w-6 rounded-full"
        />
        <span className="mr-auto">{source.name}</span>
        <Button
          className="laptop:hidden"
          {...buttonProps}
          aria-label={unfollowingSource ? 'Follow' : 'Block'}
        />
        {!unfollowingSource && (
          <SourceSubscribeButton className="ml-3 laptop:mr-3" source={source} />
        )}
        <Button className="hidden laptop:flex" {...buttonProps}>
          {unfollowingSource ? 'Follow' : 'Block'}
        </Button>
      </CustomFeedHeader>
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
