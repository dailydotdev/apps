import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { SquadPerkPage } from '@dailydotdev/shared/src/features/squads/components/perks/SquadPerks';
import type { SquadRouteProps } from '../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  SquadRoute,
} from '../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../next-seo';

interface SquadPerkRouteProps extends SquadRouteProps {
  perkId: string;
}

// A perk's own page: a squad sub-page, like Products or Members.
const SquadPerkRoute = ({
  handle,
  perkId,
}: SquadPerkRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadPerkPage perkId={perkId} />
  </SquadRoute>
);

SquadPerkRoute.getLayout = getSquadRouteLayout;
SquadPerkRoute.layoutProps = {
  seo: { title: 'Squad perk', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  perkId: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadPerkRouteProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !params.perkId) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, perkId: params.perkId } };
};

export default SquadPerkRoute;
