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
  const { data: opportunity, isPending } = useQuery({
    ...opportunityByIdOptions({ id: opportunityId }),
    enabled: !!opportunityId,
  });

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!opportunity) {
      push(`${opportunityUrl}/${opportunityId}`);
    }
  }, [opportunity, opportunityId, push, isPending]);

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
