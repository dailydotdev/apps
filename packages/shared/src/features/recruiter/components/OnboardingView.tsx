import type { ReactElement } from 'react';
import React from 'react';
import { RecruiterHeader } from '../../../components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '../../../components/recruiter/Progress';
import { OpportunityPreviewProvider } from '../../opportunity/context/OpportunityPreviewContext';
import { AnalyzeContent } from '../../opportunity/components/analyze/AnalyzeContent';

export const OnboardingView = (): ReactElement => {
  return (
    <OpportunityPreviewProvider mockData={{}}>
      <div className="pointer-events-none flex flex-1 flex-col blur-sm">
        <RecruiterHeader />
        <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
        <AnalyzeContent loadingStep={0} />
      </div>
    </OpportunityPreviewProvider>
  );
};
