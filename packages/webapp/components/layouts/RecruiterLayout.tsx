import type { ReactNode } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import type { RecruiterLayoutProps } from '@dailydotdev/shared/src/components/RecruiterLayout';
import { RecruiterLayout } from '@dailydotdev/shared/src/components/RecruiterLayout';
import { useIntercom } from '../../hooks/useIntercom';

const RecruiterLayoutWithIntercom = ({
  children,
  layoutProps,
}: {
  children: ReactNode;
  layoutProps?: RecruiterLayoutProps;
}) => {
  const router = useRouter();
  useIntercom();

  return (
    <RecruiterLayout {...layoutProps} activePage={router?.asPath}>
      {children}
    </RecruiterLayout>
  );
};

const GetLayout = (
  page: ReactNode,
  layoutProps?: RecruiterLayoutProps,
): ReactNode => {
  return (
    <RecruiterLayoutWithIntercom layoutProps={layoutProps}>
      {page}
    </RecruiterLayoutWithIntercom>
  );
};

export { GetLayout as getLayout };
