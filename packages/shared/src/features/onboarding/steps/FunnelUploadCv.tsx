import React from 'react';
import type { ReactElement } from 'react';
import type { FunnelStepUploadCv } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { UploadCv } from '../../../components/onboarding';
import { useUploadCv } from '../../profile/hooks/useUploadCv';

function FunnelUploadCvComponent({
  parameters,
  onTransition,
}: FunnelStepUploadCv): ReactElement | null {
  const { user } = useAuthContext();
  const { onUpload, status, isSuccess } = useUploadCv({
    shouldOpenModal: false,
  });

  const handleComplete = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
    });
  };

  const isDisabled = !isSuccess;

  const { linkedin } = parameters;

  const hasLinkedInContent =
    linkedin &&
    (linkedin.cta ||
      linkedin.image ||
      linkedin.headline ||
      linkedin.explainer ||
      (linkedin.steps && linkedin.steps.length > 0));

  if (!user) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      disabled={isDisabled}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <UploadCv
        {...parameters}
        onFilesDrop={([file]) => onUpload(file)}
        status={status}
        showLinkedInExport={!!hasLinkedInContent}
      />
    </FunnelStepCtaWrapper>
  );
}

export const FunnelUploadCv = withIsActiveGuard(FunnelUploadCvComponent);
