import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { NextSeoProps } from 'next-seo';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { ClientError } from 'graphql-request';
import { BellIcon } from '@dailydotdev/shared/src/components/icons';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import Link from '@dailydotdev/shared/src/components/utilities/Link';
import type { SquadStaticData } from '@dailydotdev/shared/src/graphql/squads';
import {
  getSquad,
  getSquadStaticFields,
} from '@dailydotdev/shared/src/graphql/squads';
import type {
  SourceData,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  isSourceUserSource,
  SOURCE_QUERY,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  LogEvent,
  NotificationPromptSource,
} from '@dailydotdev/shared/src/lib/log';
import { useLogContext } from '@dailydotdev/shared/src/contexts/LogContext';
import { useJoinReferral } from '@dailydotdev/shared/src/hooks/referral/useJoinReferral';
import { useSquad } from '@dailydotdev/shared/src/hooks/squads/useSquad';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { StaleTime } from '@dailydotdev/shared/src/lib/query';
import { LazyModal } from '@dailydotdev/shared/src/components/modals/common/types';
import { useLazyModal } from '@dailydotdev/shared/src/hooks/useLazyModal';
import { getPathnameWithQuery } from '@dailydotdev/shared/src/lib';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { usePrivateSourceJoin } from '@dailydotdev/shared/src/hooks/source/usePrivateSourceJoin';
import { GET_REFERRING_USER_QUERY } from '@dailydotdev/shared/src/graphql/users';
import type {
  PublicProfile,
  UserShortProfile,
} from '@dailydotdev/shared/src/lib/user';
import {
  ToastSubject,
  useToastNotification,
} from '@dailydotdev/shared/src/hooks/useToastNotification';
import { useEnableNotification } from '@dailydotdev/shared/src/hooks/notifications/useEnableNotification';
import { useRecentPageMeta } from '@dailydotdev/shared/src/hooks/useRecentPages';
import {
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SquadHome } from '@dailydotdev/shared/src/features/squads/components/SquadHome';
import { SquadPageSkeleton } from '@dailydotdev/shared/src/features/squads/components/SquadPageSkeleton';
import { hasSquadFeature } from '@dailydotdev/shared/src/features/squads/lib/features';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { getSquadOpenGraph, noindexSeoProps } from '../../../next-seo';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import type { DynamicSeoProps } from '../../../components/common';
import { getAppOrigin } from '../../../lib/seo';
import { createSquadNotificationToastStateStore } from '../../../lib/squadNotificationToastState';
import { SquadRoute } from '../../../components/squads/SquadRoute';

const appOrigin = getAppOrigin();
const getSquadPageJsonLd = (
  squad: SquadStaticData,
  profileUrls: string[],
): string => {
  const squadUrl = squad.permalink;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${squadUrl}#organization`,
        name: squad.name,
        url: squadUrl,
        ...(squad.description && { description: squad.description }),
        ...(squad.image && { logo: squad.image, image: squad.image }),
        ...(profileUrls.length > 0 && { sameAs: profileUrls }),
        ...(squad.createdAt && {
          foundingDate: new Date(squad.createdAt).toISOString().split('T')[0],
        }),
        ...(squad.membersCount > 0 && {
          interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: { '@type': 'JoinAction' },
            userInteractionCount: squad.membersCount,
          },
        }),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${squadUrl}#page`,
        url: squadUrl,
        name: squad.name,
        about: { '@id': `${squadUrl}#organization` },
        isPartOf: { '@type': 'WebSite', url: appOrigin },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: appOrigin,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Squads',
            item: `${appOrigin}/squads`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: squad.name,
          },
        ],
      },
    ],
  });
};

const getSquadProfileUrls = (squad?: Squad): string[] => {
  if (!squad || !hasSquadFeature(squad, 'links')) {
    return [];
  }

  return [...(squad.website ? [squad.website] : []), ...(squad.links ?? [])];
};

interface SourcePageProps extends DynamicSeoProps {
  handle: string;
  initialData?: SquadStaticData;
  /** Public squads only: the page renders from it on the server. */
  initialSquad?: Squad;
  referringUser?: Pick<PublicProfile, 'id' | 'name' | 'image'>;
  jsonLd?: string;
  seoUsers?: SquadSeoUsers;
}

type SquadSeoUser = Pick<UserShortProfile, 'id' | 'name' | 'permalink'>;

interface SquadSeoUsers {
  privilegedMembers: SquadSeoUser[];
  topMembers: SquadSeoUser[];
}

const getSeoSquadUsers = (squad?: Squad): SquadSeoUsers | undefined => {
  if (!squad?.public) {
    return undefined;
  }

  return {
    privilegedMembers:
      squad.privilegedMembers?.map(({ user }) => ({
        id: user.id,
        name: user.name,
        permalink: user.permalink,
      })) ?? [],
    topMembers:
      squad.topMembers?.map(({ id, name, permalink }) => ({
        id,
        name,
        permalink,
      })) ?? [],
  };
};

const SquadSeoLinks = ({
  seoUsers,
}: {
  seoUsers?: SquadSeoUsers;
}): ReactElement | null => {
  if (!seoUsers?.topMembers.length) {
    return null;
  }

  return (
    <div className="sr-only">
      {seoUsers.topMembers.map((member) => (
        <Link key={member.id} href={member.permalink} prefetch={false}>
          <a>Posts by {member.name}</a>
        </Link>
      ))}
    </div>
  );
};

const SquadPage = ({
  handle,
  initialSquad,
  jsonLd,
  seoUsers,
}: SourcePageProps): ReactElement => {
  const router = useRouter();
  const { openModal } = useLazyModal();
  useJoinReferral();
  const { logEvent } = useLogContext();
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const [loggedImpression, setLoggedImpression] = useState(false);
  const { squad, isFetched, isForbidden } = useSquad({ handle });
  const squadId = squad?.id;
  useRecentPageMeta({ image: squad?.image ?? initialSquad?.image });
  const shownToastForSquadInSession = useRef<Record<string, boolean>>({});
  const squadNotificationToastState = useMemo(
    () => createSquadNotificationToastStateStore(user?.id),
    [user?.id],
  );
  const { shouldShowCta, onEnable, onDismiss } = useEnableNotification({
    source: NotificationPromptSource.SquadPage,
  });

  useEffect(() => {
    if (
      !shouldShowCta ||
      !squadId ||
      !isFetched ||
      shownToastForSquadInSession.current[squadId]
    ) {
      return;
    }

    const shouldShowToast = squadNotificationToastState.registerToastView({
      squadId,
      isSquadMember: !!squad?.currentMember,
    });
    if (!shouldShowToast) {
      return;
    }

    shownToastForSquadInSession.current[squadId] = true;

    displayToast('Get notified about new Squad activity.', {
      subject: ToastSubject.Feed,
      persistent: true,
      action: {
        copy: 'Turn on',
        onClick: async () => {
          const didEnable = await onEnable();
          if (!didEnable) {
            squadNotificationToastState.dismissUntilTomorrow({ squadId });
          }

          return didEnable;
        },
        buttonProps: {
          size: ButtonSize.Small,
          variant: ButtonVariant.Primary,
          color: ButtonColor.Cabbage,
          icon: (
            <BellIcon className="origin-top motion-safe:[animation:enable-notification-bell-ring_1.1s_ease-in-out_1.5s_infinite]" />
          ),
          iconPosition: ButtonIconPosition.Left,
        },
      },
      onClose: () => {
        onDismiss();
      },
    });
  }, [
    displayToast,
    isFetched,
    onDismiss,
    onEnable,
    shouldShowCta,
    squad?.currentMember,
    squadId,
    squadNotificationToastState,
  ]);

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

  const searchQuery =
    typeof router.query?.q === 'string' ? router.query.q.trim() : '';

  // Next's router.replace needs the concrete path here, not the
  // `/squads/[handle]` pathname, so it is built from `asPath`.
  const onClearSearch = useCallback(() => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete('q');

    return router.replace(
      getPathnameWithQuery(router.asPath.split('?')[0], searchParams),
      undefined,
      { shallow: true },
    );
  }, [router]);

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

  return (
    <>
      {jsonLd && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd }}
          />
        </Head>
      )}
      <SquadSeoLinks seoUsers={getSeoSquadUsers(squad) ?? seoUsers} />
      {privateSourceJoin.isActive ? (
        <SquadPageSkeleton />
      ) : (
        <SquadRoute handle={handle} initialSquad={initialSquad}>
          <SquadHome searchQuery={searchQuery} onClearSearch={onClearSearch} />
        </SquadRoute>
      )}
    </>
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
  const handle = params?.handle;
  if (!handle) {
    return {
      notFound: true,
    };
  }
  const { userid: userId, cid: campaign } = query;

  const setCacheHeader = () => {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, must-revalidate, s-maxage=${StaleTime.OneHour}, stale-while-revalidate=${StaleTime.OneHour}`,
    );
  };

  try {
    const sourceResult = await gqlClient.request<SourceData>(SOURCE_QUERY, {
      id: handle,
    });

    if (isSourceUserSource(sourceResult.source)) {
      setCacheHeader();

      return {
        redirect: {
          destination: `/${sourceResult.source.id}`,
          permanent: false,
        },
      };
    }

    if (sourceResult.source?.type === SourceType.Machine) {
      setCacheHeader();

      return {
        redirect: {
          destination: `/sources/${handle}`,
          permanent: false,
        },
      };
    }

    const referringUserPromise =
      userId && campaign
        ? gqlClient
            .request<{ user: SourcePageProps['referringUser'] }>(
              GET_REFERRING_USER_QUERY,
              {
                id: userId,
              },
            )
            .then((data) => data?.user)
            .catch(() => undefined)
        : Promise.resolve(undefined);

    const [squad, referringUser] = await Promise.all([
      getSquadStaticFields(handle),
      referringUserPromise,
    ]);

    // Fail closed: anything we can't positively confirm as a public squad stays
    // out of the index. The API's own gate covers inactive, vordr and tiny
    // squads on top of that.
    const isPublicSquad = squad?.public === true;
    const noindex = !isPublicSquad || squad?.noindex === true;

    const initialSquad = isPublicSquad
      ? await getSquad(handle).catch(() => undefined)
      : undefined;
    const seoUsers = getSeoSquadUsers(initialSquad);

    setCacheHeader();

    const seoTitleSource = referringUser
      ? `${referringUser.name} invited you to ${squad.name}`
      : `${squad.name} Squad`;
    const squadSeoTitles = getPageSeoTitles(seoTitleSource);

    const seo: NextSeoProps = {
      title: squadSeoTitles.title,
      description: squad.description,
      openGraph: {
        ...squadSeoTitles.openGraph,
        ...getSquadOpenGraph({ squad }),
      },
      nofollow: noindex,
      noindex,
    };

    return {
      props: {
        seo,
        handle,
        initialData: squad,
        ...(initialSquad && { initialSquad }),
        ...(seoUsers && { seoUsers }),
        ...(referringUser && { referringUser }),
        ...(isPublicSquad && {
          jsonLd: getSquadPageJsonLd(squad, getSquadProfileUrls(initialSquad)),
        }),
      },
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);
    const errorCode = clientError?.response?.errors?.[0]?.extensions?.code;

    if (errors.includes(errorCode)) {
      setCacheHeader();

      // SSR always runs unauthenticated, so every private squad resolves as
      // FORBIDDEN here. This branch also serves the soft-404/rate-limited
      // cases, none of which should ever be advertised as indexable.
      return {
        props: { handle, seo: { ...noindexSeoProps } },
      };
    }

    throw err;
  }
}
