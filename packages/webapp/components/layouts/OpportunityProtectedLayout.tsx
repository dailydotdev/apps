import React, { useEffect } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

import { useRouter } from 'next/router';

import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { getLayout as getRecruiterLayout } from './RecruiterLayout';

export const OpportunityProtectedLayout = ({
  children,
}: PropsWithChildren): ReactNode => {
  const {
    query: { id },
    push,
  } = useRouter();
  const opportunityId = id as string;
  const { data: opportunity } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    enabled: false,
  });

  useEffect(() => {
    if (!opportunity) {
      push(`${opportunityUrl}/${opportunityId}`);
    }
  }, [opportunity, opportunityId, push]);

  if (!opportunity) {
    return null;
  }

  return children;
};

export const getOpportunityProtectedLayout: typeof getRecruiterLayout = (
  page,
  ...props
) =>
  getRecruiterLayout(
    <OpportunityProtectedLayout>{page}</OpportunityProtectedLayout>,
    ...props,
  );
