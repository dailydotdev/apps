import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSidePropsResult } from 'next';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';

const SquadsPage = (): ReactElement => {
  return <></>;
};

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
