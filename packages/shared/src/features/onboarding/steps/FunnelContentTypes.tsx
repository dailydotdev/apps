import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { FunnelStepContentTypes } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ContentTypes } from '../../../components/onboarding';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';

function FunnelContentTypesComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepContentTypes): ReactElement | null {
  const { isLoggedIn } = useAuthContext();

  const handleComplete = useCallback(() => {
    onTransition({ type: FunnelStepTransitionType.Complete });
  }, [onTransition]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <FunnelStepCtaWrapper
      cta={{ label: cta || 'Next' }}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
    >
      <div className="flex w-full flex-col items-center gap-6 p-6 pt-10 laptop:max-w-screen-laptop">
        <ContentTypes headline={headline} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelContentTypes = withIsActiveGuard(
  FunnelContentTypesComponent,
);
