import { createContextProvider } from '@kickass-coderz/react';
import {
  useOpportunityPreview,
  useOpportunityPreviewDetails,
} from '../graphql/opportunities';

const [OpportunityPreviewProvider, useOpportunityPreviewContext] =
  createContextProvider(() => {
    const { data } = useOpportunityPreview();
    const { data: detailsData } = useOpportunityPreviewDetails();

    return { ...data, ...detailsData };
  });

export { OpportunityPreviewProvider, useOpportunityPreviewContext };
