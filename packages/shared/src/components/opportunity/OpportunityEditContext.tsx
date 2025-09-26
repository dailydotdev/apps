import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { opportunityByIdOptions } from '../../features/opportunity/queries';
import { useAuthContext } from '../../contexts/AuthContext';

export type OpportunityEditContextProps = {
  children: ReactNode;
  opportunityId: string;
};

const [OpportunityEditProvider, useOpportunityEditContext] =
  createContextProvider((props: OpportunityEditContextProps) => {
    const { opportunityId } = props;
    const { user } = useAuthContext();

    const { data: opportunity } = useQuery(
      opportunityByIdOptions({ id: opportunityId }),
    );

    const canEdit = useMemo(() => {
      if (!user) {
        return false;
      }

      return !!opportunity?.recruiters?.some((item) => item.id === user.id);
    }, [opportunity, user]);

    return {
      canEdit,
    };
  });

export { OpportunityEditProvider, useOpportunityEditContext };
