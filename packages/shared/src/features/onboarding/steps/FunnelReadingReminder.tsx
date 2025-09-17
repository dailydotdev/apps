import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { withIsActiveGuard } from '../shared/withActiveGuard';
import { useViewSize, ViewSize } from '../../../hooks';
import { usePushNotificationContext } from '../../../contexts/PushNotificationContext';
import { withShouldSkipStepGuard } from '../shared/withShouldSkipStepGuard';

function FunnelReadingReminderComponent({
  parameters: { headline },
  onTransition,
}: FunnelStepReadingReminder): ReactElement | null {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pt-10 tablet:max-w-96">
      <ReadingReminder
        headline={headline}
        onClickNext={() =>
          onTransition({ type: FunnelStepTransitionType.Complete })
        }
      />
    </div>
  );
}

export const FunnelReadingReminder = withShouldSkipStepGuard(
  withIsActiveGuard(FunnelReadingReminderComponent),
  () => {
    const { isPushSupported, isInitialized } = usePushNotificationContext();
    const isMobile = useViewSize(ViewSize.MobileXL);
    const shouldSkip = !isMobile || (isInitialized && !isPushSupported);

    return { shouldSkip };
  },
);
