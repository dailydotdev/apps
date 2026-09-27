import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import type { SquadRouteProps } from '../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../next-seo';

const SquadManage = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage />
  </SquadRoute>
);

SquadManage.getLayout = getSquadRouteLayout;
SquadManage.layoutProps = {
  seo: { title: 'Manage Squad', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadManage;
