import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { FunnelStepInstallPwa } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { OnboardingPWA } from '../../../components/onboarding';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { isIOS, isPWA } from '../../../lib/func';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';

function FunnelInstallPwaComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepInstallPwa): ReactElement | null {
  const handleComplete = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  }, [onTransition]);

  return (
    <FunnelStepCtaWrapper
      cta={{ label: cta || 'Next' }}
      onClick={handleComplete}
    >
      <div className="flex flex-col items-center gap-6 p-6 pt-10 tablet:max-w-96">
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
