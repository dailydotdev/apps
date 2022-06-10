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
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonProps,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CustomFeedHeader,
  FeedPage,
} from '@dailydotdev/shared/src/components/utilities';
import PlusIcon from '@dailydotdev/shared/src/components/icons/Plus';
import BlockIcon from '@dailydotdev/shared/src/components/icons/Block';
import useFeedSettings from '@dailydotdev/shared/src/hooks/useFeedSettings';
import useTagAndSource from '@dailydotdev/shared/src/hooks/useTagAndSource';
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
    () => ({ source: source?.id, ranking: 'TIME' }),
    [source?.id],
  );

  const { feedSettings } = useFeedSettings();
  const { onFollowSource, onUnfollowSource } = useTagAndSource({
    origin: 'source page',
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
    titleTemplate: '%s',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  const buttonProps: ButtonProps<'button'> = {
    buttonSize: 'small',
    icon: unfollowingSource ? <PlusIcon /> : <BlockIcon />,
    onClick: async (): Promise<void> => {
      if (user) {
        if (unfollowingSource) {
          await onFollowSource({ source });
        } else {
          await onUnfollowSource({ source });
        }
      } else {
        showLogin('filter');
      }
    },
  };

  return (
    <FeedPage>
      <NextSeo {...seo} />
      <CustomFeedHeader>
        <img
          src={source.image}
          alt={`${source.name} logo`}
          className="mr-2 w-6 h-6 rounded-lg"
        />
        <span className="mr-auto">{source.name}</span>
        <Button
          className="laptop:hidden btn-secondary"
          {...buttonProps}
          aria-label={unfollowingSource ? 'Follow' : 'Block'}
        />
        <Button className="hidden laptop:flex btn-secondary" {...buttonProps}>
          {unfollowingSource ? 'Follow' : 'Block'}
        </Button>
      </CustomFeedHeader>
      <Feed
        feedName="source"
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
    const res = await request<SourceData>(`${apiUrl}/graphql`, SOURCE_QUERY, {
      id: params.source,
    });

    return {
      props: {
        source: res.source,
      },
      revalidate: 60,
    };
  } catch (err) {
    if (err?.response?.errors?.[0].extensions.code === 'NOT_FOUND') {
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
