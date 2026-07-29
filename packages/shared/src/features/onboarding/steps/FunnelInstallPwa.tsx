import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FunnelStepInstallPwa } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { OnboardingPWA } from '../../../components/onboarding';
import { FunnelStepCtaWrapper, funnelStepRail } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { isIOS, isPWA } from '../../../lib/func';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';

function FunnelInstallPwaComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepInstallPwa): ReactElement | null {
  return (
    <FunnelStepCtaWrapper
      isGlass
      cta={{ label: cta || 'Continue' }}
      onClick={() => onTransition({ type: FunnelStepTransitionType.Complete })}
    >
      <div
        className={classNames(
          funnelStepRail,
          'flex flex-col items-center gap-6 py-6 pt-3',
        )}
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
