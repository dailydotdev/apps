import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
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
import { getSquadMembers } from '@dailydotdev/shared/src/graphql/squads';
import { SourceMember, Squad } from '@dailydotdev/shared/src/graphql/sources';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import SquadLoading from '@dailydotdev/shared/src/components/errors/SquadLoading';
import { useQuery } from 'react-query';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useSquadOnboarding } from '@dailydotdev/shared/src/hooks/useSquadOnboarding';
import dynamic from 'next/dynamic';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import { supportedTypesForPrivateSources } from '@dailydotdev/shared/src/graphql/posts';
import { useJoinReferral, useSquad } from '@dailydotdev/shared/src/hooks';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage, {
  ProtectedPageProps,
} from '../../../components/ProtectedPage';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);
const SquadTourPopup = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadTourPopup" */ '@dailydotdev/shared/src/components/squads/SquadTourPopup'
    ),
);

const SquadEmptyScreen = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadEmptyScreen" */ '@dailydotdev/shared/src/components/squads/SquadEmptyScreen'
    ),
);

const SquadChecklistCard = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadChecklistCard" */ '@dailydotdev/shared/src/components/checklist/SquadChecklistCard'
    ),
);

type SourcePageProps = { handle: string };

const PageComponent = (props: ProtectedPageProps & { squad: Squad }) => {
  const { squad, seo, children, ...restProtectedPageProps } = props;

  if (squad.public) {
    return (
      <>
        {seo}
        {children}
      </>
    );
  }

  return (
    <ProtectedPage {...restProtectedPageProps} seo={seo}>
      {children}
    </ProtectedPage>
  );
};

const SquadPage = ({ handle }: SourcePageProps): ReactElement => {
  useJoinReferral();
  const { trackEvent } = useContext(AnalyticsContext);
  const { sidebarRendered } = useSidebarRendered();
  const { isFallback } = useRouter();
  const { user, isFetched: isBootFetched } = useContext(AuthContext);
  const [trackedImpression, setTrackedImpression] = useState(false);
  const { squad, isLoading, isFetched, isForbidden } = useSquad({ handle });

  const squadId = squad?.id;

  useEffect(() => {
    if (trackedImpression || !squadId) return;

    trackEvent({
      event_name: AnalyticsEvent.ViewSquadPage,
      extra: JSON.stringify({ squad: squadId }),
    });
    setTrackedImpression(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squadId, trackedImpression]);

  const { data: squadMembers } = useQuery<SourceMember[]>(
    ['squadMembersInitial', handle],
    () => getSquadMembers(squadId),
    { enabled: isBootFetched && !!squadId },
  );

  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(
    () => ({
      source: squadId,
      ranking: 'TIME',
      supportedTypes: supportedTypesForPrivateSources,
    }),
    [squadId],
  );

  const isFinishedLoading = isFetched && !isLoading && !!squad;

  const { isPopupOpen, onClosePopup, hasTriedOnboarding } = useSquadOnboarding(
    isFinishedLoading && !isForbidden,
  );

  useEffect(() => {
    if (!isForbidden) return;

    trackEvent({
      event_name: AnalyticsEvent.ViewSquadForbiddenPage,
      extra: JSON.stringify({ squad: squadId ?? handle }),
    });
  }, [isForbidden, squadId, handle, trackEvent]);

  if ((isFallback || isLoading) && !isFetched) return <SquadLoading />;

  if (!isFetched) return <></>;

  if (isForbidden) return <Unauthorized />;

  if (!squad) return <Custom404 />;

  const seo = (
    <NextSeo title={`${squad.name} posts on daily.dev`} nofollow noindex />
  );

  return (
    <PageComponent
      squad={squad}
      seo={seo}
      fallback={<></>}
      shouldFallback={!user}
    >
      {isPopupOpen && <SquadTourPopup onClose={onClosePopup} />}
      <BaseFeedPage className="relative pt-2 laptop:pt-8 mb-4">
        <div
          className={classNames(
            'absolute top-0 w-full h-full squad-background-fade',
            sidebarRendered && '-left-full translate-x-[60%]',
          )}
        />
        <SquadPageHeader
          squad={squad}
          members={squadMembers}
          hasTriedOnboarding={hasTriedOnboarding && !isPopupOpen}
        />
        <SquadChecklistCard squad={squad} />
        <Feed
          className="px-6 laptop:px-0 pt-14 laptop:pt-10"
          feedName="squad"
          feedQueryKey={[
            'sourceFeed',
            user?.id ?? 'anonymous',
            Object.values(queryVariables),
          ]}
          query={SOURCE_FEED_QUERY}
          variables={queryVariables}
          forceCardMode
          emptyScreen={<SquadEmptyScreen />}
          options={{ refetchOnMount: true }}
          allowPin
        />
      </BaseFeedPage>
    </PageComponent>
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
