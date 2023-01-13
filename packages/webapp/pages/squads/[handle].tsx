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
import Custom404 from '../404';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import { getLayout } from '../../components/layouts/FeedLayout';
import ProtectedPage from '../../components/ProtectedPage';

type SourcePageProps = {
  squad: Squad;
  squadMembers: SquadMember[];
};

const SquadPage = ({ squad, squadMembers }: SourcePageProps): ReactElement => {
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
        <SquadPageHeader squad={squad} members={squadMembers} />
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

export async function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): Promise<
  GetStaticPropsResult<SourcePageProps>
> {
  try {
    const squad = await getSquad(params.handle);
    const squadMembers = await getSquadMembers(squad.id);
    return {
      props: {
        squad,
        squadMembers,
      },
      revalidate: 60,
    };
  } catch (err) {
    if (err?.response?.errors?.[0].extensions.code === 'NOT_FOUND') {
      return {
        props: {
          squad: null,
          squadMembers: [],
        },
        revalidate: 60,
      };
    }
    throw err;
  }
}
