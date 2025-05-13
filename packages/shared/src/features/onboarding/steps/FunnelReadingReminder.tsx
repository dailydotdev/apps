import type { ReactElement } from 'react';
import React from 'react';
import type { FunnelStepReadingReminder } from '../types/funnel';
import { FunnelStepTransitionType } from '../types/funnel';
import { ReadingReminder } from '../../../components/onboarding';
import { withIsActiveGuard } from '../shared/withActiveGuard';

function FunnelReadingReminderComponent({
  parameters: { headline },
  onTransition,
}: FunnelStepReadingReminder): ReactElement | null {
  const handleSubmit = ({ skipped }: { skipped?: boolean } = {}) => {
    onTransition({
      type: skipped
        ? FunnelStepTransitionType.Skip
        : FunnelStepTransitionType.Complete,
    });
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 pt-10 tablet:max-w-96">
      <ReadingReminder headline={headline} onClickNext={handleSubmit} />
    </div>
  );
}

export const FunnelReadingReminder = withIsActiveGuard(
  FunnelReadingReminderComponent,
);
