import React from 'react';
import { LoadingBlock } from './LoadingBlock';
import { RelevantBlock } from './RelevantBlock';
import { JobInfo } from './JobInfo';

type ContentSidebarProps = {
  loadingStep: number;
};

export const ContentSidebar = ({ loadingStep }: ContentSidebarProps) => {
  return (
    <div className="flex w-[22.5rem] flex-col gap-4 border-r border-border-subtlest-tertiary p-4">
      <LoadingBlock loadingStep={loadingStep} />
      <RelevantBlock loadingStep={loadingStep} />
      <JobInfo loadingStep={loadingStep} />
    </div>
  );
};
