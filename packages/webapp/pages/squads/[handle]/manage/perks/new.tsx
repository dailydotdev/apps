import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import type { SquadRouteProps } from '../../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../../next-seo';

const SquadAddPerk = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage section={SquadManageSection.Perks} perkId={null} />
  </SquadRoute>
);

SquadAddPerk.getLayout = getSquadRouteLayout;
SquadAddPerk.layoutProps = {
  seo: { title: 'Add perk', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadAddPerk;
