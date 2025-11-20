import type { ReactNode } from 'react';
import React from 'react';
import type { RecruiterSelfServeLayoutProps } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { RecruiterLayout } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';

const GetLayout = (
  page: ReactNode,
  pageProps: Record<string, unknown>,
  layoutProps?: RecruiterSelfServeLayoutProps,
): ReactNode => {
  return <RecruiterLayout {...layoutProps}>{page}</RecruiterLayout>;
};

export { GetLayout as getLayout };
