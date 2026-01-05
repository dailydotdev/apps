import type { ReactElement } from 'react';
import React from 'react';
import { RecruiterHeader } from '../../../components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '../../../components/recruiter/Progress';
import type { OpportunityPreviewContextType } from '../../opportunity/context/OpportunityPreviewContext';
import { OpportunityPreviewProvider } from '../../opportunity/context/OpportunityPreviewContext';
import { AnalyzeContent } from '../../opportunity/components/analyze/AnalyzeContent';

export type OnboardingViewProps = {
  mockData: OpportunityPreviewContextType;
  loadingStep: number;
};

export const OnboardingView = ({
  mockData,
  loadingStep,
}: OnboardingViewProps): ReactElement => {
  return (
    <OpportunityPreviewProvider mockData={mockData}>
      <div className="pointer-events-none flex flex-1 flex-col blur-sm">
        <RecruiterHeader />
        <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
        <AnalyzeContent loadingStep={loadingStep} />
      </div>
    </OpportunityPreviewProvider>
  );
};
