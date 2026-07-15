import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Switch } from '../../fields/Switch';
import { useNotificationToggle } from '../../../hooks/notifications';
import useSidebarRendered from '../../../hooks/useSidebarRendered';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import PollDurationDropdown from '../poll/PollDurationDropdown';
import { useWritePostContext } from '../../../contexts';
import { SchedulePostControl } from '../schedule/SchedulePostControl';

interface WriteFooterProps {
  isLoading?: boolean;
  className?: string;
  isPoll?: boolean;
}

export function WriteFooter({
  isLoading,
  className,
  isPoll,
}: WriteFooterProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
  const { schedule } = useWritePostContext();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();

  return (
    <span
      className={classNames(
        'relative flex flex-col flex-wrap tablet:flex-row',
        !sidebarRendered && 'justify-center',
        isPoll ? 'tablet:items-end' : 'items-center',
        className,
      )}
    >
      {isPoll && <PollDurationDropdown />}
      {shouldShowCta && (
        <Switch
          data-testid="push_notification-switch"
          inputId="push_notification-switch"
          name="push_notification"
          labelClassName="flex-1 font-normal"
          className="py-3"
          compact={false}
          checked={isEnabled}
          onToggle={onToggle}
        >
          Receive updates whenever your Squad members engage with your post
        </Switch>
      )}
      <div
        className={classNames(
          'ml-auto hidden w-full items-center gap-2 tablet:w-auto laptop:flex',
          shouldShowCta && 'mt-6',
        )}
      >
        {schedule && (
          <SchedulePostControl schedule={schedule} disabled={isLoading} />
        )}
        <Button
          type="submit"
          variant={ButtonVariant.Primary}
          color={ButtonColor.Cabbage}
          className="w-full tablet:mt-0 tablet:w-32"
          disabled={isLoading}
          loading={isLoading}
          onClick={onSubmitted}
        >
          {schedule?.isScheduled ? 'Schedule' : 'Post'}
        </Button>
      </div>
    </span>
  );
}
