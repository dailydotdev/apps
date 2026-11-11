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

const SquadAddJob = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage section={SquadManageSection.Jobs} jobId={null} />
  </SquadRoute>
);

SquadAddJob.getLayout = getSquadRouteLayout;
SquadAddJob.layoutProps = {
  seo: { title: 'Add role', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadAddJob;
