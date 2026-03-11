import React, { useRef, useState, useEffect } from 'react';
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

function FunnelUploadCvComponent({
  parameters,
  onTransition,
}: FunnelStepUploadCv): ReactElement | null {
  const { user } = useAuthContext();
  const { onUpload, status, isSuccess } = useUploadCv({
    shouldOpenModal: false,
  });

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
        {...parameters}
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
    const initializedRef = useRef(false);
    const [shouldSkip, setShouldSkip] = useState(false);

    // since withShouldSkipStepGuard returns null when uploading cv and setting action
    // funnel component would show null instead of in success state due to action being set
    // so we evaluate skip only first time actions are fetched
    useEffect(() => {
      if (isActionsFetched && !initializedRef.current) {
        initializedRef.current = true;

        setShouldSkip(hasUploadedCv);
      }
    }, [isActionsFetched, hasUploadedCv]);

    return { shouldSkip };
  },
);
