import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { FunnelStepContentTypes } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ContentTypes } from '../../../components/onboarding';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getContentTypeNotEmpty } from '../../../components/onboarding/ContentTypes/helpers';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useAdvancedSettings } from '../../../hooks';

function FunnelContentTypesComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepContentTypes): ReactElement | null {
  const isOnboarding = useIsOnboardingFunnel();
  const { isLoggedIn } = useAuthContext();
  const { advancedSettings } = useFeedSettings();
  const { selectedSettings, checkSourceBlocked } = useAdvancedSettings();

  const handleComplete = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  }, [onTransition]);

  if (!isLoggedIn) {
    return null;
  }

  const isDisabled = !getContentTypeNotEmpty({
    advancedSettings,
    selectedSettings,
    checkSourceBlocked,
  });

  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: cta || (isOnboarding ? 'Continue' : 'Next') }}
      onClick={handleComplete}
      containerClassName={
        isOnboarding
          ? 'flex w-full flex-1 flex-col items-center overflow-hidden'
          : 'flex w-full flex-1 flex-col items-center justify-center overflow-hidden'
      }
      disabled={isDisabled}
    >
      {/* single-column on mobile, so the cards sit on the CTA rail; from tablet
          up the grid needs more room than the rail and stays centered instead */}
      <div
        className={
          isOnboarding
            ? classNames(
                funnelStepRail,
                'flex flex-col items-center gap-6 py-6 pt-3 tablet:max-w-none laptop:max-w-screen-laptop',
              )
            : 'flex w-full flex-col items-center gap-6 p-6 pt-10 laptop:max-w-screen-laptop'
        }
      >
        <ContentTypes headline={headline} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelContentTypes = withIsActiveGuard(
  FunnelContentTypesComponent,
);
