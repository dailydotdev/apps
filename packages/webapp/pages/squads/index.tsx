import React, { ReactElement } from 'react';
import { InfiniteData } from '@tanstack/react-query';
import { GetServerSidePropsResult } from 'next';
import { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SourcesQueryData } from '@dailydotdev/shared/src/hooks/source/useSources';
import { squadCategoriesPaths } from '@dailydotdev/shared/src/lib/constants';

export type Props = {
  initialData?: InfiniteData<SourcesQueryData<Squad>>;
};

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
