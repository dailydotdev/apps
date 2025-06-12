import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';

function FunnelReadingReminderComponent({
  parameters: { headline },
  onTransition,
}: FunnelStepReadingReminder): ReactElement | null {
  const isMobile = useViewSize(ViewSize.MobileXL);
  const { isPushSupported, isInitialized } = usePushNotificationContext();
  const haveEvaluated = useRef(false);

  const handleSubmit = useCallback(
    ({ skipped }: { skipped?: boolean } = {}) => {
      onTransition({
        type: skipped
          ? FunnelStepTransitionType.Skip
          : FunnelStepTransitionType.Complete,
      });
    },
    [onTransition],
  );

  useEffect(() => {
    if (haveEvaluated.current) {
      return;
    }

    console.log({ isMobile, isInitialized, isPushSupported });

    if (!isMobile || (isInitialized && !isPushSupported)) {
      handleSubmit({ skipped: false });
    }

    haveEvaluated.current = true;
  }, [handleSubmit, isInitialized, isMobile, isPushSupported]);

  if (!isMobile || !isInitialized || !isPushSupported) {
    return null;
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pt-10 tablet:max-w-96">
      <ReadingReminder headline={headline} onClickNext={handleSubmit} />
    </div>
  );
}

export const FunnelReadingReminder = withIsActiveGuard(
  FunnelReadingReminderComponent,
);
