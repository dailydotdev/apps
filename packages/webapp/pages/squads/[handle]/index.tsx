import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextSeoProps } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import {
  SOURCE_FEED_QUERY,
  supportedTypesForPrivateSources,
} from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageHeader } from '@dailydotdev/shared/src/components/squads/SquadPageHeader';
import SquadFeedHeading from '@dailydotdev/shared/src/components/squads/SquadFeedHeading';
import {
  BaseFeedPage,
  FeedPageLayoutList,
} from '@dailydotdev/shared/src/components/utilities';
import {
  getSquadMembers,
  getSquadStaticData,
  SquadStaticData,
} from '@dailydotdev/shared/src/graphql/squads';
import { SourceMember, Squad } from '@dailydotdev/shared/src/graphql/sources';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import { useQuery } from '@tanstack/react-query';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import LogContext from '@dailydotdev/shared/src/contexts/LogContext';
import dynamic from 'next/dynamic';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import {
  useFeedLayout,
  useJoinReferral,
  useSquad,
} from '@dailydotdev/shared/src/hooks';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import { ClientError } from 'graphql-request';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { getReferringUser } from '@dailydotdev/shared/src/graphql/users';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { useRouter } from 'next/router';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { usePrivateSourceJoin } from '@dailydotdev/shared/src/hooks/source/usePrivateSourceJoin';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage, {
  ProtectedPageProps,
} from '../../../components/ProtectedPage';
import { getSquadOpenGraph } from '../../../next-seo';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import { DynamicSeoProps } from '../../../components/common';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);

const SquadEmptyScreen = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadEmptyScreen" */ '@dailydotdev/shared/src/components/squads/SquadEmptyScreen'
    ),
);

const SquadLoading = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadLoading" */ '@dailydotdev/shared/src/components/errors/SquadLoading'
    ),
  { ssr: false },
);

interface SourcePageProps extends DynamicSeoProps {
  handle: string;
  initialData?: SquadStaticData;
}

const PageComponent = (props: ProtectedPageProps & { squad: Squad }) => {
  const { squad, children, ...restProtectedPageProps } = props;

  if (squad.public) {
    return <>{children}</>;
  }

  return <ProtectedPage {...restProtectedPageProps}>{children}</ProtectedPage>;
};

const SquadPage = ({ handle, initialData }: SourcePageProps): ReactElement => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  useJoinReferral();
  const { logEvent } = useContext(LogContext);
  const { sidebarRendered } = useSidebarRendered();
  const { shouldUseListFeedLayout, shouldUseListMode } = useFeedLayout();
  const { user, isFetched: isBootFetched } = useContext(AuthContext);
  const [loggedImpression, setLoggedImpression] = useState(false);
  const { squad, isLoading, isFetched, isForbidden } = useSquad({ handle });
  const squadId = squad?.id;

  useEffect(() => {
    if (loggedImpression || !squadId) {
      return;
    }

    logEvent({
      event_name: LogEvent.ViewSquadPage,
      extra: JSON.stringify({ squad: squadId }),
    });
    setLoggedImpression(true);
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squadId, loggedImpression]);

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

  useEffect(() => {
    if (!isForbidden) {
      return;
    }

    logEvent({
      event_name: LogEvent.ViewSquadForbiddenPage,
      extra: JSON.stringify({ squad: squadId ?? handle }),
    });
  }, [isForbidden, squadId, handle, logEvent]);

  const shouldManageSlack = router.query?.lzym === LazyModal.SlackIntegration;

  useEffect(() => {
    if (!shouldManageSlack || !squad) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('lzym');
    router.replace(
      getPathnameWithQuery(`${webappUrl}squads/${squad.handle}`, searchParams),
      undefined,
      {
        shallow: true,
      },
    );

    openModal({
      type: LazyModal.SlackIntegration,
      props: {
        source: squad,
      },
    });
  }, [shouldManageSlack, squad, openModal, router]);

  const privateSourceJoin = usePrivateSourceJoin();

  if ((isLoading && !isFetched) || privateSourceJoin.isActive) {
    return (
      <SquadLoading
        squad={squad || initialData}
        sidebarRendered={sidebarRendered}
      />
    );
  }

  if (!isFetched) {
    return <></>;
  }

  if (isForbidden) {
    return <Unauthorized />;
  }

  if (!squad) {
    return <Custom404 />;
  }

  const FeedPageComponent = shouldUseListMode
    ? FeedPageLayoutList
    : BaseFeedPage;

  return (
    <PageComponent squad={squad} fallback={<></>} shouldFallback={!user}>
      <FeedPageComponent
        className={classNames('relative mb-4 pt-2 laptop:pt-8')}
      >
        <div
          className={classNames(
            'squad-background-fade absolute top-0 h-full w-full',
            sidebarRendered &&
              !shouldUseListMode &&
              '-left-full translate-x-[60%]',
          )}
        />
        <SquadPageHeader
          squad={squad}
          members={squadMembers}
          shouldUseListMode={shouldUseListMode}
        />
        <Feed
          className={classNames(
            'pt-14 laptop:pt-10',
            shouldUseListFeedLayout ? 'px-0' : 'px-6',
          )}
          feedName={OtherFeedPage.Squad}
          feedQueryKey={[
            'sourceFeed',
            user?.id ?? 'anonymous',
            Object.values(queryVariables),
          ]}
          query={SOURCE_FEED_QUERY}
          variables={queryVariables}
          showSearch={false}
          emptyScreen={<SquadEmptyScreen />}
          options={{ refetchOnMount: true }}
          header={<SquadFeedHeading squad={squad} />}
          inlineHeader
          allowPin
        />
      </FeedPageComponent>
    </PageComponent>
  );
};

SquadPage.getLayout = getLayout;
SquadPage.layoutProps = { ...mainFeedLayoutProps, canGoBack: true };

export default SquadPage;

interface SquadPageParams extends ParsedUrlQuery {
  handle: string;
}

export async function getServerSideProps({
  params,
  query,
  res,
}: GetServerSidePropsContext<SquadPageParams>): Promise<
  GetServerSidePropsResult<SourcePageProps>
> {
  const { handle } = params;
  const { userid: userId, cid: campaign } = query;

  const setCacheHeader = () => {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${oneHour}, stale-while-revalidate=${oneHour}`,
    );
  };

  try {
    const promises = [];

    promises.push(getSquadStaticData(handle));

    if (userId && campaign) {
      promises.push(getReferringUser(userId as string));
    }

    const [{ source: squad }, referringUser] = await Promise.all(promises);

    if (squad?.type === 'machine') {
      return {
        redirect: {
          destination: `/sources/${handle}`,
          permanent: false,
        },
      };
    }

    setCacheHeader();

    const seo: NextSeoProps = {
      title: referringUser
        ? `${referringUser.name} invited you to ${squad.name}`
        : getTemplatedTitle(`${squad.name} Squad`),
      description: squad.description,
      openGraph: getSquadOpenGraph({ squad }),
      nofollow: !squad.public,
      noindex: !squad.public,
    };

    return {
      props: {
        seo,
        handle,
        initialData: squad,
      },
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);

    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      setCacheHeader();

      return {
        props: { handle },
      };
    }

    throw err;
  }
}
