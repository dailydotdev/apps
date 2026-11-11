import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadIntelPage } from '@dailydotdev/shared/src/features/squads/components/SquadIntelPage';
import type { SquadRouteProps } from '../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../next-seo';

const SquadIntel = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadIntelPage />
  </SquadRoute>
);

SquadIntel.getLayout = getSquadRouteLayout;
SquadIntel.layoutProps = {
  seo: { title: 'Weekly intel', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadIntel;
