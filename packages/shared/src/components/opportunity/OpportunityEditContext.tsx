import { createContextProvider } from '@kickass-coderz/react';
import type { ReactNode } from 'react';

export type OpportunityEditContextProps = {
  children: ReactNode;
};

const [OpportunityEditProvider, useOpportunityEditContext] =
  createContextProvider((props: OpportunityEditContextProps) => {
    return {
      canEdit: true, // TODO job-upload real logic
    };
  });

export { OpportunityEditProvider, useOpportunityEditContext };
