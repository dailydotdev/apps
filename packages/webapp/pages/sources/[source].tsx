/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import sizeN from '@dailydotdev/shared/macros/sizeN.macro';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../../components/Feed';
import { SOURCE_FEED_QUERY } from '../../graphql/feed';
import { Source, SOURCE_QUERY, SourceData } from '../../graphql/sources';
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import Custom404 from '../404';
import useMutateFilters, {
  getSourcesSettingsQueryKey,
} from '@dailydotdev/shared/src/hooks/useMutateFilters';
import { useQuery } from 'react-query';
import {
  FeedSettingsData,
  SOURCES_SETTINGS_QUERY,
} from '../../graphql/feedSettings';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  Button,
  ButtonProps,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  CustomFeedHeader,
  FeedPage,
} from '@dailydotdev/shared/src/components/utilities';
import PlusIcon from '@dailydotdev/shared/icons/plus.svg';
import { trackEvent } from '@dailydotdev/shared/src/lib/analytics';

type SourcePageProps = { source: Source };

const SourcePage = ({ source }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ source: source?.id }), [source?.id]);

  const queryKey = getSourcesSettingsQueryKey(user);
  const { data: feedSettings } = useQuery<FeedSettingsData>(
    queryKey,
    () => request(`${apiUrl}/graphql`, SOURCES_SETTINGS_QUERY),
    {
      enabled: !!user && tokenRefreshed,
    },
  );

  const { followSource } = useMutateFilters(user);

  const showAddSource = useMemo(() => {
    if (!feedSettings?.feedSettings) {
      return true;
    }
    return (
      feedSettings.feedSettings.excludeSources.findIndex(
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

  const buttonCss = css`
    visibility: ${showAddSource ? 'visible' : 'hidden'};
  `;
  const buttonProps: ButtonProps<'button'> = {
    buttonSize: 'small',
    icon: <PlusIcon />,
    onClick: async (): Promise<void> => {
      trackEvent({
        category: 'Feed',
        action: 'Add Filter',
      });
      if (user) {
        await followSource({ source });
      } else {
        showLogin();
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
          css={css`
            width: ${sizeN(6)};
            height: ${sizeN(6)};
            border-radius: ${sizeN(2)};
            margin-right: ${sizeN(2)};
          `}
        />
        <span
          css={css`
            margin-right: auto;
          `}
        >
          {source.name}
        </span>
        <Button
          className="btn-primary laptop:hidden"
          {...buttonProps}
          css={buttonCss}
          aria-label="Add source to feed"
        />
        <Button
          className="btn-primary hidden laptop:flex"
          {...buttonProps}
          css={buttonCss}
        >
          Add to feed
        </Button>
      </CustomFeedHeader>
      <Feed
        query={SOURCE_FEED_QUERY}
        variables={queryVariables}
        css={css`
          margin-top: ${sizeN(3)};
          margin-bottom: ${sizeN(3)};
        `}
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
