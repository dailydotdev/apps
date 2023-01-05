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
import request from 'graphql-request';
import { apiUrl } from '@dailydotdev/shared/src/lib/config';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  SquadPageHeader
} from '@dailydotdev/shared/src/components/squads/SquadPageHeader';
import {
  FeedPage
} from '@dailydotdev/shared/src/components/utilities';
import Custom404 from '../404';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';
import { Squad, SquadData, SQUAD_QUERY } from '@dailydotdev/shared/src/graphql/squads';

type SourcePageProps = { squad: Squad };

const SquadPage = ({ squad }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({ source: squad?.id, ranking: 'TIME' }),
    [squad?.id],
  );

  if (!isFallback && !squad) {
    return <Custom404 />;
  }

  if (isFallback || !squad) {
    return <></>;
  }

  const seo: NextSeoProps = {
    title: `${squad.name} posts on daily.dev`,
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };
  const members = user ? [user] : [];
  const memberCount = 16;

  return (
    <FeedPage
      className="laptop:px-0 mb-4"
    style={{
      background: 'radial-gradient(ellipse, #c029f088 0%, #c029f000 400px)',
      backgroundSize: '1200px 500px',
      backgroundPosition: 'center -270px',
      backgroundRepeat: 'no-repeat',
    }}>
      <NextSeo {...seo} />
      <SquadPageHeader squad={squad} members={members} memberCount={memberCount}/>
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

SquadPage.getLayout = getLayout;
SquadPage.layoutProps = mainFeedLayoutProps;

export default SquadPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface SquadPageParams extends ParsedUrlQuery {
  handle: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): Promise<
  GetStaticPropsResult<SourcePageProps>
> {
  try {
    const res = await request<SquadData>(`${apiUrl}/graphql`, SQUAD_QUERY, {
      handle: params.handle,
    });
    return {
      props: {
        squad: res.source,
      },
      revalidate: 60,
    };
  } catch (err) {
    if (err?.response?.errors?.[0].extensions.code === 'NOT_FOUND') {
      return {
        props: {
          squad: null,
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
