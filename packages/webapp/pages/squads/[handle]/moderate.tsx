import type { ReactElement } from 'react';
import React from 'react';
import type { GetServerSidePropsResult } from 'next';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

const Page = (): ReactElement => {
  return <></>;
};

export async function getServerSideProps(): Promise<
  GetServerSidePropsResult<void>
> {
  return {
    redirect: {
      destination: `${webappUrl}squads/moderate`,
      permanent: true,
    },
  };
}

export default Page;
