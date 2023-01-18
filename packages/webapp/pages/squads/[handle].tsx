import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { SOURCE_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageHeader } from '@dailydotdev/shared/src/components/squads/SquadPageHeader';
import { FeedPage } from '@dailydotdev/shared/src/components/utilities';
import {
  getSquad,
  getSquadMembers,
  Squad,
  SquadMember,
} from '@dailydotdev/shared/src/graphql/squads';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { useQuery } from 'react-query';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';
import ProtectedPage from '../../components/ProtectedPage';

type SourcePageProps = { handle: string };

const SquadPage = ({ handle }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();
  const queryKey = ['squad', handle];
  const { data: squad, isLoading } = useQuery<Squad>(
    queryKey,
    () => getSquad(handle),
    {
      enabled: !!handle,
    },
  );
  const squadId = squad?.id;

  const { data: squadMembers } = useQuery<SquadMember[]>(
    ['squadMembers', handle],
    () => getSquadMembers(squadId),
    { enabled: !!squadId },
  );

  const { user } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({ source: squadId, ranking: 'TIME' }),
    [squadId],
  );

  if (!squad && isLoading) return <></>; // loading screen

  if (isFallback) return <Unauthorized />;

  const seo = (
    <NextSeo title={`${squad.name} posts on daily.dev`} nofollow noindex />
  );

  return (
    <ProtectedPage seo={seo} fallback={<></>} shouldFallback={!user}>
      <FeedPage
        className="laptop:pr-0 laptop:pl-0 mb-4"
        style={{
          background: 'radial-gradient(ellipse, #c029f088 0%, #c029f000 400px)',
          backgroundSize: '1200px 500px',
          backgroundPosition: 'center -270px',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <SquadPageHeader
          squad={squad}
          members={squadMembers}
          userId={user?.id}
        />
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
    </ProtectedPage>
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

export function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): GetStaticPropsResult<SourcePageProps> {
  return {
    props: {
      handle: params.handle,
    },
  };
}
