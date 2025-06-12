import type { ReactElement } from 'react';
import React, { useRef, useCallback, useEffect } from 'react';
import type { FunnelStepInstallPwa } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { OnboardingPWA } from '../../../components/onboarding';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { isIOS, isPWA } from '../../../lib/func';

function FunnelInstallPwaComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepInstallPwa): ReactElement | null {
  const isMobile = useViewSize(ViewSize.MobileXL);
  const shouldSkip = !isIOS() || isPWA() || !isMobile;
  const haveEvaluated = useRef(false);

  const handleComplete = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  }, [onTransition]);

  useEffect(() => {
    if (shouldSkip && !haveEvaluated.current) {
      handleComplete();
    }
    haveEvaluated.current = true;
  }, [shouldSkip, handleComplete]);

  if (shouldSkip) {
    return null;
  }

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

export const FunnelInstallPwa = withIsActiveGuard(FunnelInstallPwaComponent);
