/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useMemo } from 'react';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { CustomFeedHeader, FeedPage } from '../../components/utilities';
import sizeN from '../../macros/sizeN.macro';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../../components/Feed';
import { SOURCE_FEED_QUERY } from '../../graphql/feed';
import { Source, SOURCE_QUERY, SourceData } from '../../graphql/sources';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import Custom404 from '../404';

type SourcePageProps = { source: Source };

const SourcePage = ({ source }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();

  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ source: source?.id }), [source?.id]);

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
