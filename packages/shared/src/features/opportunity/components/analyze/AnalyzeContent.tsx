import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { useOpportunityPreviewContext } from '../../context/OpportunityPreviewContext';
import { OpportunityPreviewStatus } from '../../types';
import { JobInfo } from './JobInfo';
import { ReachHeroSection } from './ReachHeroSection';
import { PlusUserIcon } from '../../../../components/icons/PlusUser';
import { IconSize } from '../../../../components/Icon';

type AnalyzeContentProps = {
  loadingStep: number;
};

export const AnalyzeContent = ({ loadingStep }: AnalyzeContentProps) => {
  const data = useOpportunityPreviewContext();
  const isReady = data?.result?.status === OpportunityPreviewStatus.READY;
  const totalCount = data?.result?.totalCount ?? 0;

  const isError = data?.result?.status === OpportunityPreviewStatus.ERROR;
  const showReachHero = !isError && loadingStep >= 2;

  return (
    <div className="flex flex-1 justify-center overflow-auto bg-background-subtle p-4 laptop:p-6">
      <div className="flex w-full max-w-3xl flex-col gap-6">
        {/* Hero Section - Matching Stats */}
        {showReachHero && (
          <ReachHeroSection totalCount={totalCount} isLoading={!isReady} />
        )}

        {isError && (
          <div className="flex items-center justify-center rounded-16 border border-border-subtlest-tertiary bg-background-default p-6">
            <div className="flex max-w-96 flex-1 flex-col items-center gap-2 text-center">
              <PlusUserIcon size={IconSize.XXXLarge} />
              <Typography type={TypographyType.Body}>
                We didn&apos;t find any matching candidates at this time, but
                don&apos;t worry—this doesn&apos;t necessarily mean there&apos;s
                a problem. Our team is here to help.{' '}
                <Typography bold type={TypographyType.Body}>
                  Feel free to continue by selecting a plan and we can assist
                  you further.
                </Typography>
              </Typography>
            </div>
          </div>
        )}

        {/* Job Summary */}
        <div className="rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="mb-3"
          >
            Parsed from your job post
          </Typography>
          <JobInfo loadingStep={loadingStep} />
        </div>
      </div>
    </div>
  );
};
