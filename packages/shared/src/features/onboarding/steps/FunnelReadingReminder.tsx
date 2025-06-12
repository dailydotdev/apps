import type { ReactElement } from 'react';
import React, { useCallback, useEffect } from 'react';
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
  const { isPushSupported } = usePushNotificationContext();

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
    if (!isMobile || !isPushSupported) {
      handleSubmit({ skipped: true });
    }
  }, [handleSubmit, isMobile, isPushSupported]);

  if (!isMobile || !isPushSupported) {
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
