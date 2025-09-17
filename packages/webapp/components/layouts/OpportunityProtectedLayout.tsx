import React, { useEffect } from 'react';
import type { PropsWithChildren, ReactNode } from 'react';

import { useRouter } from 'next/router';

import { opportunityUrl } from '@dailydotdev/shared/src/lib/constants';
import { useQueryClient } from '@tanstack/react-query';
import type { Opportunity } from '@dailydotdev/shared/src/features/opportunity/types';
import { opportunityByIdOptions } from '@dailydotdev/shared/src/features/opportunity/queries';
import { getLayout as getNoSidebarLayout } from './NoSidebarLayout';

export const OpportunityProtectedLayout = ({
  children,
}: PropsWithChildren): ReactNode => {
  const {
    query: { id },
    push,
  } = useRouter();
  const opportunityId = id as string;
  const queryClient = useQueryClient();
  const opportunity = queryClient.getQueryData<Opportunity>(
    opportunityByIdOptions({ id: opportunityId }).queryKey,
  );

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

export const getOpportunityProtectedLayout: typeof getNoSidebarLayout = (
  page,
  ...props
) =>
  getNoSidebarLayout(
    <OpportunityProtectedLayout>{page}</OpportunityProtectedLayout>,
    ...props,
  );
