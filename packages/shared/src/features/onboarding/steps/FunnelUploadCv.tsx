import React, { useMemo } from 'react';
import type { ReactElement } from 'react';
import type { FunnelStepUploadCv } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';
import { UploadCv } from '../components/UploadCv';
import { useUploadCv } from '../../profile/hooks/useUploadCv';
import { useActions } from '../../../hooks';
import { ActionType } from '../../../graphql/actions';
import { useUploadCvVariant } from '../hooks/useUploadCvVariant';

function FunnelUploadCvComponent({
  parameters,
  onTransition,
}: FunnelStepUploadCv): ReactElement | null {
  const { user } = useAuthContext();
  const { onUpload, status, isSuccess } = useUploadCv({
    shouldOpenModal: false,
  });
  const variant = useUploadCvVariant();

  const mergedParameters = useMemo(() => {
    // Only override if variant has non-empty values (v1/control has empty strings)
    return {
      ...parameters,
      headline: variant.headline || parameters.headline,
      description: variant.description || parameters.description,
    };
  }, [parameters, variant]);

  if (!user) {
    return null;
  }

  const handleComplete = () => {
    onTransition({
      type: FunnelStepTransitionType.Complete,
    });
  };

  const isDisabled = !isSuccess;

  return (
    <FunnelStepCtaWrapper
      disabled={isDisabled}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <UploadCv
        {...mergedParameters}
        onFilesDrop={([file]) => onUpload(file)}
        status={status}
      />
    </FunnelStepCtaWrapper>
  );
}

export const FunnelUploadCv = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelUploadCvComponent),
  () => {
    const { checkHasCompleted, isActionsFetched } = useActions();
    const hasUploadedCv = checkHasCompleted(ActionType.UploadedCV);
    const shouldSkip = isActionsFetched && hasUploadedCv;

    return { shouldSkip };
  },
);
