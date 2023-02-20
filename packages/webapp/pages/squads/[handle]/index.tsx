import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ClientError } from 'graphql-request';
import { ParsedUrlQuery } from 'querystring';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import { SOURCE_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageHeader } from '@dailydotdev/shared/src/components/squads/SquadPageHeader';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
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
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { isNullOrUndefined } from '@dailydotdev/shared/src/lib/func';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage from '../../../components/ProtectedPage';

type SourcePageProps = { handle: string };

const SquadPage = ({ handle }: SourcePageProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { isFallback } = useRouter();
  const [isForbidden, setIsForbidden] = useState(false);
  const { openModal } = useLazyModal();
  const { user, isFetched: isBootFetched } = useContext(AuthContext);
  const [trackedImpression, setTrackedImpression] = useState(false);
  const queryKey = ['squad', handle];
  const {
    data: squad,
    isLoading,
    isFetched,
  } = useQuery<Squad, ClientError>(queryKey, () => getSquad(handle), {
    enabled: isBootFetched && !!handle && !isForbidden,
    retry: false,
    onError: (err) => {
      const isErrorForbidden =
        err?.response?.errors?.[0]?.extensions?.code === ApiError.Forbidden;
      if (!isForbidden && isErrorForbidden) setIsForbidden(true);
    },
  });

  const squadId = squad?.id;

  useEffect(() => {
    if (trackedImpression || !squadId) return;

    trackEvent({
      event_name: AnalyticsEvent.ViewSquadPage,
      extra: JSON.stringify({ squad: squadId }),
    });
    setTrackedImpression(true);
  }, [squadId, trackedImpression]);

  const { data: squadMembers } = useQuery<SquadMember[]>(
    ['squadMembersInitial', handle],
    () => getSquadMembers(squadId),
    { enabled: isBootFetched && !!squadId },
  );

  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      source: squadId,
      ranking: 'TIME',
    }),
    [squadId],
  );

  if (isLoading && !isFetched && !squad) return <SquadLoading />;

  if (!isFetched) return <></>;

  const isInactive = !isNullOrUndefined(squad) && !squad.active;

  if (isFallback || isInactive || isForbidden) return <Unauthorized />;

  if (!squad) return <Custom404 />;

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
      <BaseFeedPage className="relative pt-2 mb-4 squad-background-fade">
        <SquadPageHeader
          squad={squad}
          members={squadMembers}
          onNewSquadPost={onNewSquadPost}
          userId={user?.id}
        />
        <Feed
          className="px-6 laptop:px-16"
          feedName="source"
          feedQueryKey={[
            'sourceFeed',
            user?.id ?? 'anonymous',
            Object.values(queryVariables),
          ]}
          query={SOURCE_FEED_QUERY}
          variables={queryVariables}
          forceCardMode
          options={{ refetchOnMount: true }}
        />
      </BaseFeedPage>
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
