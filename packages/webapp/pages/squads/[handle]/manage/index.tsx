import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import type { SquadRouteProps } from '../../../../components/squads/SquadRoute';
import {
  getSquadManageSeo,
  getSquadRouteLayout,
  SquadRoute,
} from '../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../next-seo';

const SquadManage = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle} hasStaffLayer={false}>
    <SquadManagePage />
  </SquadRoute>
);

SquadManage.getLayout = getSquadRouteLayout;
SquadManage.layoutProps = {
  seo: { title: 'Manage Squad', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async ({
  params,
}) => {
  const handle = params?.handle;

  if (typeof handle !== 'string') {
    return { notFound: true };
  }

  return { props: { handle, seo: await getSquadManageSeo(handle) } };
};

export default SquadManage;
