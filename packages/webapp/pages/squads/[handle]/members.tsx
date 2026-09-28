import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadMembersPage } from '@dailydotdev/shared/src/features/squads/components/SquadSubPages';
import type { SquadRouteProps } from '../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../next-seo';

const SquadMembers = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadMembersPage />
  </SquadRoute>
);

SquadMembers.getLayout = getSquadRouteLayout;
SquadMembers.layoutProps = {
  seo: { title: 'Squad members', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadMembers;
