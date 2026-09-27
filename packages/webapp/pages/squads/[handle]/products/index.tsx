import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSideProps } from 'next';
import { SquadProductsPage } from '@dailydotdev/shared/src/features/squads/components/SquadSubPages';
import type { SquadRouteProps } from '../../../../components/squads/SquadRoute';
import {
  getSquadRouteLayout,
  getSquadRouteProps,
  SquadRoute,
} from '../../../../components/squads/SquadRoute';
import { noindexSeoProps } from '../../../../next-seo';

const SquadProducts = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle} feature="products">
    <SquadProductsPage />
  </SquadRoute>
);

SquadProducts.getLayout = getSquadRouteLayout;
SquadProducts.layoutProps = {
  seo: { title: 'Squad products', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadProducts;
