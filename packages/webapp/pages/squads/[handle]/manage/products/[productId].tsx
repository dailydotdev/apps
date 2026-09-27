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

interface SquadEditProductProps extends SquadRouteProps {
  productId: string;
}

const SquadEditProduct = ({
  handle,
  productId,
}: SquadEditProductProps): ReactElement => (
  <SquadRoute handle={handle}>
    <SquadManagePage
      section={SquadManageSection.Products}
      productId={productId}
    />
  </SquadRoute>
);

SquadEditProduct.getLayout = getSquadRouteLayout;
SquadEditProduct.layoutProps = {
  seo: { title: 'Edit product', ...noindexSeoProps },
};

interface Params extends ParsedUrlQuery {
  handle: string;
  productId: string;
}

export const getServerSideProps: GetServerSideProps<
  SquadEditProductProps,
  Params
> = async ({ params }) => {
  if (!params?.handle || !params.productId) {
    return { notFound: true };
  }

  return { props: { handle: params.handle, productId: params.productId } };
};

export default SquadEditProduct;
