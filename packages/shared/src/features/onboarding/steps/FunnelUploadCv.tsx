import React, { useRef, useState, useEffect } from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import type { FunnelStepUploadCv } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { useAuthContext } from '../../../contexts/AuthContext';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
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
  // Shared with the paid funnel, which keeps its original chrome.
  const isOnboarding = useIsOnboardingFunnel();
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
      isGlass={isOnboarding}
      disabled={isDisabled}
      // The stepper's header used to carry this step's skip; onboarding hides
      // that header, so the step supplies it to its own top bar.
      {...(isOnboarding && {
        skip: {
          cta: 'Skip',
          onClick: () => onTransition({ type: FunnelStepTransitionType.Skip }),
        },
      })}
      onClick={handleComplete}
      containerClassName={
        isOnboarding
          ? 'flex w-full flex-1 flex-col items-center overflow-hidden'
          : 'flex w-full flex-1 flex-col items-center justify-center overflow-hidden'
      }
    >
      <div
        className={
          isOnboarding
            ? classNames(
                funnelStepRail,
                // Production's own max-width for this step: the LinkedIn
                // helper is a two-column block and does not fit the 440px rail.
                'flex flex-col gap-6 py-6 pt-3 laptop:max-w-[48.75rem]',
              )
            : undefined
        }
      >
        <UploadCv
          {...parameters}
          isOnboarding={isOnboarding}
          onFilesDrop={([file]) => onUpload(file)}
          status={status}
        />
      </div>
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
