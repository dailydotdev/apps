import React, { ReactElement } from 'react';
import { GetServerSidePropsResult } from 'next';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';

const SquadsPage = (): ReactElement => {
  return <></>;
};

export const runtime = 'experimental-edge';

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<void>
> {
  return {
    redirect: {
      destination: squadCategoriesPaths.discover,
      permanent: true,
    },
  };
}

export default SquadsPage;
