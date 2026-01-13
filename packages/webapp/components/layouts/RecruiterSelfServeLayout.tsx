import type { ReactNode } from 'react';
import React from 'react';
import type { RecruiterSelfServeLayoutProps } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { RecruiterLayout } from '@dailydotdev/shared/src/components/recruiter/layout/RecruiterLayout';
import { PendingSubmissionProvider } from '@dailydotdev/shared/src/features/opportunity/context/PendingSubmissionContext';
import { useIntercom } from '../../hooks/useIntercom';
import { recruiterSeo } from '../../next-seo';

const RecruiterSelfServeLayoutWithIntercom = ({
  children,
  layoutProps,
}: {
  children: ReactNode;
  layoutProps?: RecruiterSelfServeLayoutProps;
}) => {
  useIntercom();

  return (
    <PendingSubmissionProvider>
      <RecruiterLayout {...layoutProps}>{children}</RecruiterLayout>
    </PendingSubmissionProvider>
  );
};

const GetLayout = (
  page: ReactNode,
  _pageProps: Record<string, unknown>,
  layoutProps?: RecruiterSelfServeLayoutProps,
): ReactNode => {
  return (
    <RecruiterSelfServeLayoutWithIntercom layoutProps={layoutProps}>
      {page}
    </RecruiterSelfServeLayoutWithIntercom>
  );
};

export { GetLayout as getLayout };

export const layoutProps = { seo: recruiterSeo };
