import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import dynamic from 'next/dynamic';
import type { ParsedUrlQuery } from 'querystring';
import type { GetServerSidePropsResult } from 'next';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { useSquad } from '@dailydotdev/shared/src/hooks/squads/useSquad';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadPrivateWall } from '@dailydotdev/shared/src/features/squads/components/SquadPrivateWall';
import { SquadPageSkeleton } from '@dailydotdev/shared/src/features/squads/components/SquadPageSkeleton';
import type { SquadFeature } from '@dailydotdev/shared/src/features/squads/lib/features';
import { hasSquadFeature } from '@dailydotdev/shared/src/features/squads/lib/features';
import type { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { getSquadManageUrl } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { getLayout as getMainLayout } from '../layouts/MainLayout';
import { getLayout as getFooterNavBarLayout } from '../layouts/FooterNavBarLayout';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../pages/404'),
);

export interface SquadRouteProps {
  handle: string;
}

interface SquadRouteComponentProps extends SquadRouteProps {
  initialSquad?: Squad;
  /** A paid page renders nothing of itself for a squad without the feature. */
  feature?: SquadFeature;
  children: ReactNode;
}

// Loads the squad for a squad route and hands every surface the same page
// context: the private wall, not found, and the skeleton live here once.
export const SquadRoute = ({
  handle,
  initialSquad,
  feature,
  children,
}: SquadRouteComponentProps): ReactElement => {
  const { squad, isFetched, isForbidden } = useSquad({ handle });
  const current = squad ?? initialSquad;

  if (isForbidden) {
    return <SquadPrivateWall />;
  }

  if (!current) {
    return isFetched ? <Custom404 /> : <SquadPageSkeleton />;
  }

  if (feature && !hasSquadFeature(current, feature)) {
    return <Custom404 />;
  }

  return (
    <SquadPageContextProvider squad={current} isViewerReady={!!squad}>
      {children}
    </SquadPageContextProvider>
  );
};

interface SquadRouteParams extends ParsedUrlQuery {
  handle: string;
}

export const getSquadRouteProps = ({
  params,
}: {
  params?: ParsedUrlQuery;
}): GetServerSidePropsResult<SquadRouteProps> => {
  const handle = params?.handle;

  if (typeof handle !== 'string') {
    return { notFound: true };
  }

  return { props: { handle } };
};

export const getSquadRouteLayout: typeof getMainLayout = (
  page,
  pageProps,
  layoutProps,
) => getFooterNavBarLayout(getMainLayout(page, pageProps, layoutProps));

// Notifications and emails still link to the pages the Manage area replaced.
export const getLegacySquadRedirect =
  (section: SquadManageSection) =>
  async ({
    params,
  }: {
    params?: SquadRouteParams;
  }): Promise<GetServerSidePropsResult<Record<string, never>>> => {
    if (!params?.handle) {
      return { notFound: true };
    }

    return {
      redirect: {
        destination: getSquadManageUrl(params.handle, section),
        permanent: true,
      },
    };
  };

export const LegacySquadRedirectPage = (): ReactElement => <></>;
