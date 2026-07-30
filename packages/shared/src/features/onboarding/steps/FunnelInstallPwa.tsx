import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepInstallPwa } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { OnboardingPWA } from '../../../components/onboarding';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { useIsOnboardingFunnel } from '../shared/FunnelStepDots';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { isIOS, isPWA } from '../../../lib/func';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';

function FunnelInstallPwaComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepInstallPwa): ReactElement | null {
  const isOnboarding = useIsOnboardingFunnel();
  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: cta || (isOnboarding ? 'Continue' : 'Next') }}
      onClick={() => onTransition({ type: FunnelStepTransitionType.Complete })}
    >
      <div
        className={
          isOnboarding
            ? classNames(
                funnelStepRail,
                'flex flex-col items-center gap-6 py-6 pt-3',
              )
            : 'flex flex-col items-center gap-6 p-6 pt-4 mobileL:pt-10 tablet:max-w-96'
        }
      >
        <OnboardingPWA headline={headline} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelInstallPwa = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelInstallPwaComponent),
  () => {
    const isMobile = useViewSize(ViewSize.MobileXL);
    const shouldSkip = !isIOS() || isPWA() || !isMobile;

    return { shouldSkip };
  },
);
