import React from 'react';
import { Loader } from '../../../../components/Loader';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { AnonymousUserTable } from '../../../../components/recruiter/AnonymousUserTable';

type UserTableWrapperProps = {
  loadingStep: number;
};

export const UserTableWrapper = ({ loadingStep }: UserTableWrapperProps) => {
  const data = useOpportunityPreviewContext();
  const hasData = data?.edges && data.edges.length > 0;

  // Show after step 4 completes (Ranking engineers most likely to engage)
  if (!hasData || loadingStep < 4) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <AnonymousUserTable />;
};
