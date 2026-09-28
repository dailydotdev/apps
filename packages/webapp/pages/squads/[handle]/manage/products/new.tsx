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

const SquadAddProduct = ({ handle }: SquadRouteProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage section={SquadManageSection.Products} productId={null} />
  </SquadRoute>
);

SquadAddProduct.getLayout = getSquadRouteLayout;
SquadAddProduct.layoutProps = {
  seo: { title: 'Add product', ...noindexSeoProps },
};

export const getServerSideProps: GetServerSideProps<SquadRouteProps> = async (
  context,
) => getSquadRouteProps(context);

export default SquadAddProduct;
