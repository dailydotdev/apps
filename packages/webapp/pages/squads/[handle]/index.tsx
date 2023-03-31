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
} from '@dailydotdev/shared/src/graphql/squads';
import { Squad, SourceMember } from '@dailydotdev/shared/src/graphql/sources';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import SquadLoading from '@dailydotdev/shared/src/components/errors/SquadLoading';
import { useQuery } from 'react-query';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import { useSquadOnboarding } from '@dailydotdev/shared/src/hooks/useSquadOnboarding';
import dynamic from 'next/dynamic';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import { NewSquadPostProps } from '@dailydotdev/shared/src/components/squads/SharePostBar';
import {
  useTutorial,
  TutorialKey,
} from '@dailydotdev/shared/src/hooks/useTutorial';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage from '../../../components/ProtectedPage';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);
const SquadTourPopup = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadTourPopup" */ '@dailydotdev/shared/src/components/squads/SquadTourPopup'
    ),
);

type SourcePageProps = { handle: string };

const SquadPage = ({ handle }: SourcePageProps): ReactElement => {
  const { trackEvent } = useContext(AnalyticsContext);
  const { sidebarRendered } = useSidebarRendered();
  const { isFallback } = useRouter();
  const [isForbidden, setIsForbidden] = useState(false);
  const { openModal } = useLazyModal();
  const { user, isFetched: isBootFetched } = useContext(AuthContext);
  const [trackedImpression, setTrackedImpression] = useState(false);
  const [trackedForbiddenImpression, setTrackedForbiddenImpression] =
    useState(false);
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
    }),
    [squadId],
  );

  const isFinishedLoading = isFetched && !isLoading && !!squad;

  const { isPopupOpen, onClosePopup, hasTriedOnboarding } = useSquadOnboarding(
    isFinishedLoading && !isForbidden,
  );

  if (isLoading && !isFetched && !squad) return <SquadLoading />;

  if (!isFetched) return <></>;

  if (isFallback || isForbidden) {
    if (!trackedForbiddenImpression) {
      trackEvent({
        event_name: AnalyticsEvent.ViewSquadForbiddenPage,
        extra: JSON.stringify({ squad: squadId ?? handle }),
      });
      setTrackedForbiddenImpression(true);
    }
    return <Unauthorized />;
  }

  if (!squad) return <Custom404 />;

  const sharePostTutorial = useTutorial({
    key: TutorialKey.ShareSquadPost,
  });

  const copyLinkTutorial = useTutorial({
    key: TutorialKey.CopySquadLink,
  });

  const onNewSquadPost = (props: NewSquadPostProps = {}) =>
    openModal({
      type: LazyModal.PostToSquad,
      props: {
        ...props,
        squad,
        onAfterClose: () => {
          sharePostTutorial.complete();
          copyLinkTutorial.activate();
        },
      },
    });

  const seo = (
    <NextSeo title={`${squad.name} posts on daily.dev`} nofollow noindex />
  );

  return (
    <ProtectedPage seo={seo} fallback={<></>} shouldFallback={!user}>
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
          onNewSquadPost={onNewSquadPost}
          hasTriedOnboarding={hasTriedOnboarding && !isPopupOpen}
        />
        <Feed
          className="px-6 laptop:px-0 pt-14 laptop:pt-10"
          feedName="source"
          feedQueryKey={[
            'sourceFeed',
            user?.id ?? 'anonymous',
            Object.values(queryVariables),
          ]}
          query={SOURCE_FEED_QUERY}
          variables={queryVariables}
          forceCardMode
          emptyScreen={<></>}
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
