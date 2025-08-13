import React from 'react';
import type { ReactElement } from 'react';
import type { FunnelStepUploadCv } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { UploadCv } from '../../../components/onboarding';

function FunnelUploadCvComponent({
  parameters,
  onTransition,
}: FunnelStepUploadCv): ReactElement | null {
  const { user } = useAuthContext();

  const handleUploadSuccess = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        tags: [],
      },
    });
  };

  const handleComplete = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
      details: {
        tags: [],
      },
    });
  };

  const isDisabled = true;

  if (!user) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      disabled={isDisabled}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <div className="laptop:max-w-screen-laptop flex w-full flex-col items-center gap-6 p-6 pt-10">
        <UploadCv {...parameters} onUploadSuccess={handleUploadSuccess} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelUploadCv = withIsActiveGuard(FunnelUploadCvComponent);
