import React from 'react';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { AnonymousUserTable } from '../../../../components/recruiter/AnonymousUserTable';
import { OpportunityPreviewStatus } from '../../types';
import {
  Typography,
  TypographyType,
} from '../../../../components/typography/Typography';
import { GenericLoaderSpinner } from '../../../../components/utilities/loaders';
import { IconSize } from '../../../../components/Icon';

type UserTableWrapperProps = {
  loadingStep: number;
};

export const UserTableWrapper = ({ loadingStep }: UserTableWrapperProps) => {
  const data = useOpportunityPreviewContext();
  const hasData = data?.result?.status === OpportunityPreviewStatus.READY;

  // Show after step 4 completes (Ranking engineers most likely to engage)
  if (!hasData || loadingStep < 4) {
    return (
      <div className="flex flex-1 justify-center gap-4 p-4">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <GenericLoaderSpinner size={IconSize.XXXLarge} />
          <Typography type={TypographyType.Body}>
            We need a moment, we are analyzing your job requirements and looking
            for potential candidates...
          </Typography>
        </div>
      </div>
    );
  }

  return <AnonymousUserTable />;
};
