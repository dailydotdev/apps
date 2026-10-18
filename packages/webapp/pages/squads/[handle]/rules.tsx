import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadRulesPage } from '@dailydotdev/shared/src/features/squads/components/SquadSubPages';
import type { SquadRouteProps } from '../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../next-seo';

const SquadRules = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadRulesPage />
  </SquadRoute>
);

SquadRules.getLayout = getSquadRouteLayout;
SquadRules.layoutProps = {
  seo: { title: 'Squad rules', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadRules;
