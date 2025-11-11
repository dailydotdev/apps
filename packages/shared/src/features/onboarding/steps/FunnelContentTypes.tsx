import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import type { FunnelStepContentTypes } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ContentTypes } from '../../../components/onboarding';
import { FunnelStepCtaWrapper } from '../shared';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useAuthContext } from '../../../contexts/AuthContext';
import { getContentTypeNotEmpty } from '../../../components/onboarding/ContentTypes/helpers';
import useFeedSettings from '../../../hooks/useFeedSettings';
import { useAdvancedSettings } from '../../../hooks';

function FunnelContentTypesComponent({
  parameters: { headline, cta },
  onTransition,
}: FunnelStepContentTypes): ReactElement | null {
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
      cta={{ label: cta || 'Next' }}
      onClick={handleComplete}
      containerClassName="flex w-full flex-1 flex-col items-center justify-center overflow-hidden"
      disabled={isDisabled}
    >
      <div className="laptop:max-w-screen-laptop flex w-full flex-col items-center gap-6 p-6 pt-10">
        <ContentTypes headline={headline} />
      </div>
    </FunnelStepCtaWrapper>
  );
}

export const FunnelContentTypes = withIsActiveGuard(
  FunnelContentTypesComponent,
);
