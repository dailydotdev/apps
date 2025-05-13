import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepInstallPwa } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { OnboardingPWA } from '../../../components/onboarding';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function FunnelInstallPwaComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepInstallPwa): ReactElement | null {
  const handleComplete = () => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  };

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
