import type { PropsWithChildren, ReactElement } from 'react';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useJobsFeature } from '@dailydotdev/shared/src/hooks/useJobsFeature';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';

export const JobsFeatureGate = ({
  children,
}: PropsWithChildren): ReactElement | null => {
  const router = useRouter();
  const { isJobsEnabled, isLoading } = useJobsFeature();

  useEffect(() => {
    if (!isLoading && !isJobsEnabled) {
      router.replace(webappUrl);
    }
  }, [isJobsEnabled, isLoading, router]);

  if (isLoading || !isJobsEnabled) {
    return null;
  }

  return <>{children}</>;
};
