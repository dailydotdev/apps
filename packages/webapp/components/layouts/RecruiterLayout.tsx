import type { ReactNode } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { RecruiterLayoutProps } from '@dailydotdev/shared/src/components/RecruiterLayout';
import { RecruiterLayout } from '@dailydotdev/shared/src/components/RecruiterLayout';

const GetLayout = (
  page: ReactNode,
  layoutProps?: RecruiterLayoutProps,
): ReactNode => {
  const router = useRouter();

  return (
    <RecruiterLayout {...layoutProps} activePage={router?.asPath}>
      {page}
    </RecruiterLayout>
  );
};

export { GetLayout as getLayout };
