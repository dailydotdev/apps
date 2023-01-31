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
import SquadLoading from '@dailydotdev/shared/src/components/errors/SquadLoading';
import { useQuery } from 'react-query';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import Custom404 from '@dailydotdev/shared/src/components/Custom404';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage from '../../../components/ProtectedPage';

type SourcePageProps = { handle: string };

const SquadPage = ({ handle }: SourcePageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { openModal } = useLazyModal();
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
    ['squadMembersInitial', handle],
    () => getSquadMembers(squadId),
    { enabled: !!squadId },
  );

  const { user } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      source: squadId,
      ranking: 'TIME',
    }),
    [squadId],
  );

  if (isLoading) return <SquadLoading />;

  if (!squad) return <Custom404 />;

  if (isFallback || !squad.active) return <Unauthorized />;

  const onNewSquadPost = () =>
    openModal({
      type: LazyModal.PostToSquad,
      props: {
        squad,
      },
    });

  const seo = (
    <NextSeo title={`${squad.name} posts on daily.dev`} nofollow noindex />
  );

  return (
    <ProtectedPage seo={seo} fallback={<></>} shouldFallback={!user}>
      <FeedPage className="laptop:pr-0 laptop:pl-0 mb-4 squad-background-fade">
        <SquadPageHeader
          squad={squad}
          members={squadMembers}
          onNewSquadPost={onNewSquadPost}
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
          forceCardMode
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
