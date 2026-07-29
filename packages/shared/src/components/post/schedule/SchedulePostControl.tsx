import type { ReactElement } from 'react';
import React from 'react';
import { SchedulePostButton } from './SchedulePostButton';
import type { UseSchedulePost } from './useSchedulePost';

interface SchedulePostControlProps {
  schedule: UseSchedulePost;
  disabled?: boolean;
}

export function SchedulePostControl({
  schedule,
  disabled,
}: SchedulePostControlProps): ReactElement {
  return (
    <SchedulePostButton
      isScheduled={schedule.isScheduled}
      scheduledStart={schedule.scheduledStart}
      timezone={schedule.timezone}
      error={schedule.error}
      clearLabel={schedule.clearLabel}
      disabled={disabled}
      onScheduledStartChange={schedule.setScheduledStart}
      onSeedDefault={schedule.seedDefault}
      onConfirm={schedule.confirmSchedule}
      onClear={schedule.clearSchedule}
    />
  );
}
