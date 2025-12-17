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

import { anchorDefaultRel } from '../../../../lib/strings';
import { PlusUserIcon } from '../../../../components/icons';

type UserTableWrapperProps = {
  loadingStep: number;
};

export const UserTableWrapper = ({ loadingStep }: UserTableWrapperProps) => {
  const data = useOpportunityPreviewContext();
  const hasData = data?.result?.status === OpportunityPreviewStatus.READY;
  const isError =
    data?.result?.status === OpportunityPreviewStatus.ERROR ||
    (hasData && data.result.totalCount === 0);

  if (isError) {
    return (
      <div className="flex flex-1 justify-center gap-4 p-4">
        <div className="flex flex-1 flex-col items-center gap-2 text-center">
          <PlusUserIcon size={IconSize.XXXLarge} />
          <Typography type={TypographyType.Body}>
            We didn&apos;t find any matching candidates at this time, but
            don&apos;t worry—this doesn&apos;t necessarily mean there&apos;s a
            problem. Our team is here to help. Feel free to{' '}
            <a
              href="https://recruiter.daily.dev/schedule"
              className="text-text-link"
              target="_blank"
              rel={anchorDefaultRel}
            >
              reach out to us for support
            </a>{' '}
            in refining your job posting so it better attracts the right
            candidates.
          </Typography>
        </div>
      </div>
    );
  }

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
