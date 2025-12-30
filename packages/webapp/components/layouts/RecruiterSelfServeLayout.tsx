import type { ReactNode } from 'react';
import React from 'react';
import type { RecruiterSelfServeLayoutProps } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { RecruiterLayout } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { useIntercom } from '../../hooks/useIntercom';

const RecruiterSelfServeLayoutWithIntercom = ({
  children,
  layoutProps,
}: {
  children: ReactNode;
  layoutProps?: RecruiterSelfServeLayoutProps;
}) => {
  useIntercom();

  return <RecruiterLayout {...layoutProps}>{children}</RecruiterLayout>;
};

const GetLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps?: RecruiterSelfServeLayoutProps,
): ReactNode => {
  return (
    <RecruiterSelfServeLayoutWithIntercom layoutProps={layoutProps}>
      {page}
    </RecruiterSelfServeLayoutWithIntercom>
  );
};

export { GetLayout as getLayout };
