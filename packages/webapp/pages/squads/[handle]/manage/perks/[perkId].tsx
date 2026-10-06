import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import type { SquadRouteProps } from '../../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  SquadRoute,
} from '../../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../../next-seo';

interface SquadEditPerkProps extends SquadRouteProps {
  perkId: string;
}

const SquadEditPerk = ({
  handle,
  perkId,
}: SquadEditPerkProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage section={SquadManageSection.Perks} perkId={perkId} />
  </SquadRoute>
);

SquadEditPerk.getLayout = getSquadRouteLayout;
SquadEditPerk.layoutProps = {
  seo: { title: 'Edit perk', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  perkId: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadEditPerkProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !params.perkId) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, perkId: params.perkId } };
};

export default SquadEditPerk;
