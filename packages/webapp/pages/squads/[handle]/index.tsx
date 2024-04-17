import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NextSeo } from 'next-seo';
import Feed from '@dailydotdev/shared/src/components/Feed';
import {
  SOURCE_FEED_QUERY,
  supportedTypesForPrivateSources,
} from '@dailydotdev/shared/src/graphql/feed';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { SquadPageHeader } from '@dailydotdev/shared/src/components/squads/SquadPageHeader';
import SquadFeedHeading from '@dailydotdev/shared/src/components/squads/SquadFeedHeading';
import { BaseFeedPage } from '@dailydotdev/shared/src/components/utilities';
import {
  getSquadMembers,
  SQUAD_STATIC_FIELDS_QUERY,
} from '@dailydotdev/shared/src/graphql/squads';
import { SourceMember, Squad } from '@dailydotdev/shared/src/graphql/sources';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import SquadLoading from '@dailydotdev/shared/src/components/errors/SquadLoading';
import { useQuery } from '@tanstack/react-query';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import dynamic from 'next/dynamic';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import {
  useFeedLayout,
  useJoinReferral,
  useSquad,
} from '@dailydotdev/shared/src/hooks';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import request, { ClientError } from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { PublicProfile } from '@dailydotdev/shared/src/lib/user';
import { GET_REFERRING_USER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage, {
  ProtectedPageProps,
} from '../../../components/ProtectedPage';
import { getSquadOpenGraph } from '../../../next-seo';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);

const SquadEmptyScreen = dynamic(
  () =>
    import(
      /* webpackChunkName: "squadEmptyScreen" */ '@dailydotdev/shared/src/components/squads/SquadEmptyScreen'
    ),
);

type SourcePageProps = {
  handle: string;
  initialData?: Pick<Squad, 'name' | 'public' | 'description' | 'image'>;
  referringUser?: Pick<PublicProfile, 'id' | 'name' | 'image'>;
};

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

const SquadPage = ({
  handle,
  initialData,
  referringUser,
}: SourcePageProps): ReactElement => {
  useJoinReferral();
  const { trackEvent } = useContext(AnalyticsContext);
  const { sidebarRendered } = useSidebarRendered();
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const { user, isFetched: isBootFetched } = useContext(AuthContext);
  const [trackedImpression, setTrackedImpression] = useState(false);
  const { squad, isLoading, isFetched, isForbidden } = useSquad({ handle });

  const squadId = squad?.id;

  useEffect(() => {
    if (trackedImpression || !squadId) {
      return;
    }

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

  useEffect(() => {
    if (!isForbidden) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.ViewSquadForbiddenPage,
      extra: JSON.stringify({ squad: squadId ?? handle }),
    });
  }, [isForbidden, squadId, handle, trackEvent]);

  const seoData = squad || initialData;
  const seo = !!seoData && (
    <NextSeo
      title={
        referringUser
          ? `${referringUser.name} invited you to ${seoData.name}`
          : `${seoData.name} posts on daily.dev`
      }
      description={seoData.description}
      openGraph={getSquadOpenGraph({ squad: seoData })}
      nofollow={!seoData.public}
      noindex={!seoData.public}
    />
  );

  if (isLoading && !isFetched) {
    return (
      <>
        {seo}
        <SquadLoading squad={seoData} sidebarRendered={sidebarRendered} />
      </>
    );
  }

  if (!isFetched) {
    return <>{seo}</>;
  }

  if (isForbidden) {
    return <Unauthorized />;
  }

  if (!squad) {
    return <Custom404 />;
  }

  return (
    <PageComponent
      squad={squad}
      seo={seo}
      fallback={<></>}
      shouldFallback={!user}
    >
      <BaseFeedPage className="relative mb-4 pt-2 laptop:pt-8">
        <div
          className={classNames(
            'squad-background-fade absolute top-0 h-full w-full',
            sidebarRendered && '-left-full translate-x-[60%]',
          )}
        />
        <SquadPageHeader squad={squad} members={squadMembers} />
        <Feed
          className={classNames(
            'pt-14 laptop:pt-10',
            shouldUseMobileFeedLayout ? 'px-0' : 'px-6',
          )}
          feedName={OtherFeedPage.Squad}
          feedQueryKey={[
            'sourceFeed',
            user?.id ?? 'anonymous',
            Object.values(queryVariables),
          ]}
          query={SOURCE_FEED_QUERY}
          variables={queryVariables}
          forceCardMode
          showSearch={false}
          emptyScreen={<SquadEmptyScreen />}
          options={{ refetchOnMount: true }}
          header={<SquadFeedHeading squad={squad} />}
          inlineHeader
          allowPin
        />
      </BaseFeedPage>
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

    promises.push(
      request<{
        source: SourcePageProps['initialData'];
      }>(graphqlUrl, SQUAD_STATIC_FIELDS_QUERY, {
        handle,
      }),
    );

    if (userId && campaign) {
      promises.push(
        request<{ user: SourcePageProps['referringUser'] }>(
          graphqlUrl,
          GET_REFERRING_USER_QUERY,
          {
            id: userId,
          },
        ).catch(() => undefined),
      );
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

    return {
      props: {
        handle,
        initialData: squad,
        referringUser: referringUser?.user || null,
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
