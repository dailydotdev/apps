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
import {
  SQUAD_STATIC_FIELDS_QUERY,
  getSquadMembers,
} from '@dailydotdev/shared/src/graphql/squads';
import { SourceMember, Squad } from '@dailydotdev/shared/src/graphql/sources';
import Unauthorized from '@dailydotdev/shared/src/components/errors/Unauthorized';
import SquadLoading from '@dailydotdev/shared/src/components/errors/SquadLoading';
import { useQuery } from 'react-query';
import { AnalyticsEvent } from '@dailydotdev/shared/src/lib/analytics';
import AnalyticsContext from '@dailydotdev/shared/src/contexts/AnalyticsContext';
import dynamic from 'next/dynamic';
import useSidebarRendered from '@dailydotdev/shared/src/hooks/useSidebarRendered';
import classNames from 'classnames';
import { supportedTypesForPrivateSources } from '@dailydotdev/shared/src/graphql/posts';
import { useJoinReferral, useSquad } from '@dailydotdev/shared/src/hooks';
import { oneHour } from '@dailydotdev/shared/src/lib/dateFormat';
import request, { ClientError } from 'graphql-request';
import { graphqlUrl } from '@dailydotdev/shared/src/lib/config';
import { ApiError } from '@dailydotdev/shared/src/graphql/common';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import ProtectedPage, {
  ProtectedPageProps,
} from '../../../components/ProtectedPage';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
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

type SourcePageProps = {
  handle: string;
  initialData?: Pick<Squad, 'name' | 'public' | 'description' | 'image'>;
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

const SquadPage = ({ handle, initialData }: SourcePageProps): ReactElement => {
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

  useEffect(() => {
    if (!isForbidden) return;

    trackEvent({
      event_name: AnalyticsEvent.ViewSquadForbiddenPage,
      extra: JSON.stringify({ squad: squadId ?? handle }),
    });
  }, [isForbidden, squadId, handle, trackEvent]);

  const seoData = squad || initialData;
  const seo = !!seoData && (
    <NextSeo
      title={`${seoData.name} posts on daily.dev`}
      description={seoData.description}
      openGraph={{
        images: seoData.image ? [{ url: seoData.image }] : undefined,
      }}
      nofollow={!seoData.public}
      noindex={!seoData.public}
    />
  );

  if ((isFallback || isLoading) && !isFetched) {
    return (
      <>
        {seo}
        <SquadLoading />
      </>
    );
  }

  if (!isFetched) {
    return <>{seo}</>;
  }

  if (isForbidden) return <Unauthorized />;

  if (!squad) return <Custom404 />;

  return (
    <PageComponent
      squad={squad}
      seo={seo}
      fallback={<></>}
      shouldFallback={!user}
    >
      <BaseFeedPage className="relative pt-2 laptop:pt-8 mb-4">
        <div
          className={classNames(
            'absolute top-0 w-full h-full squad-background-fade',
            sidebarRendered && '-left-full translate-x-[60%]',
          )}
        />
        <SquadPageHeader squad={squad} members={squadMembers} />
        <SquadChecklistCard squad={squad} />
        <Feed
          className="px-6 pt-14 laptop:pt-10"
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

export async function getStaticProps({
  params,
}: GetStaticPropsContext<SquadPageParams>): Promise<
  GetStaticPropsResult<SourcePageProps>
> {
  const { handle } = params;

  try {
    const { source: squad } = await request<{
      source: SourcePageProps['initialData'];
    }>(graphqlUrl, SQUAD_STATIC_FIELDS_QUERY, {
      handle,
    });

    return {
      props: {
        handle,
        initialData: squad,
      },
      revalidate: oneHour,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);

    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      return {
        props: { handle },
        revalidate: oneHour,
      };
    }

    throw err;
  }
}
