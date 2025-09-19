import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';

export type OpportunityEditContextProps = {
  children: ReactNode;
  canEdit: boolean;
};

const [OpportunityEditProvider, useOpportunityEditContext] =
  createContextProvider((props: OpportunityEditContextProps) => {
    const { canEdit } = props;

    return {
      canEdit,
    };
  });

export { OpportunityEditProvider, useOpportunityEditContext };
