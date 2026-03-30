import type { ReactElement, ComponentType, ReactNode } from 'react';
import React from 'react';
import { RecruiterHeader } from '../../../components/recruiter/Header';
import {
  RecruiterProgress,
  RecruiterProgressStep,
} from '../../../components/recruiter/Progress';
import type { OpportunityPreviewContextType } from '../../opportunity/context/OpportunityPreviewContext';
import { OpportunityPreviewProvider } from '../../opportunity/context/OpportunityPreviewContext';
import { AnalyzeContent } from '../../opportunity/components/analyze/AnalyzeContent';

const PreviewProviderWithMock =
  OpportunityPreviewProvider as unknown as ComponentType<{
    children?: ReactNode;
    mockData?: OpportunityPreviewContextType;
  }>;

export const OnboardingView = (): ReactElement => {
  return (
    <PreviewProviderWithMock mockData={{} as OpportunityPreviewContextType}>
      <div className="pointer-events-none flex flex-1 flex-col blur-sm">
        <RecruiterHeader />
        <RecruiterProgress activeStep={RecruiterProgressStep.AnalyzeAndMatch} />
        <AnalyzeContent loadingStep={0} />
      </div>
    </PreviewProviderWithMock>
  );
};
