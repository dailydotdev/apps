import { createContextProvider } from '@kickass-coderz/react';
import { useOpportunityPreview } from '../queries';

const [OpportunityPreviewProvider, useOpportunityPreviewContext] =
  createContextProvider(() => {
    const { data } = useOpportunityPreview();

    return { ...data };
  });

export { OpportunityPreviewProvider, useOpportunityPreviewContext };
