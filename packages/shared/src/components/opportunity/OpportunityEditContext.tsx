import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type z from 'zod';
import { useRouter } from 'next/router';
import { opportunityByIdOptions } from '../../features/opportunity/queries';
import { useAuthContext } from '../../contexts/AuthContext';
import { OpportunityState } from '../../features/opportunity/protobuf/opportunity';
import { webappUrl } from '../../lib/constants';
import { useUpdateQuery } from '../../hooks/useUpdateQuery';

export type OpportunityEditContextProps = {
  children: ReactNode;
  opportunityId: string;
  allowDraft?: boolean;
};

const [OpportunityEditProvider, useOpportunityEditContext] =
  createContextProvider((props: OpportunityEditContextProps) => {
    const { opportunityId, allowDraft = false } = props;
    const { user } = useAuthContext();
    const router = useRouter();

    const { data: opportunity } = useQuery(
      opportunityByIdOptions({ id: opportunityId }),
    );

    const [getOpportunity] = useUpdateQuery(
      opportunityByIdOptions({ id: opportunityId }),
    );

    const canEdit = useMemo(() => {
      if (!user) {
        return false;
      }

      if (!opportunity) {
        return false;
      }

      if (opportunity.state !== OpportunityState.DRAFT) {
        return false;
      }

      if (user?.isTeamMember) {
        return true;
      }

      return !!opportunity.recruiters?.some((item) => item.id === user.id);
    }, [opportunity, user]);

    useEffect(() => {
      if (allowDraft) {
        return;
      }

      if (!opportunity) {
        return;
      }

      if (opportunity.state !== OpportunityState.DRAFT) {
        router.replace(`${webappUrl}recruiter/${opportunity.id}/matches`);
      }
    }, [allowDraft, opportunity, router]);

    return {
      canEdit,
      onValidateOpportunity: ({ schema }: { schema: z.ZodType }) => {
        const result = schema.safeParse(getOpportunity());

        return result;
      },
      opportunityId,
    };
  });

export { OpportunityEditProvider, useOpportunityEditContext };
