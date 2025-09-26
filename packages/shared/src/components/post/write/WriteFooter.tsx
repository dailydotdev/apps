import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Switch } from '../../fields/Switch';
import { useNotificationToggle } from '../../../hooks/notifications';
import useSidebarRendered from '../../../hooks/useSidebarRendered';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';
import PollDurationDropdown from '../poll/PollDurationDropdown';

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
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        color={ButtonColor.Cabbage}
        className={classNames(
          'ml-auto hidden w-full tablet:mt-0 tablet:w-32 laptop:flex',
          shouldShowCta && 'mt-6',
        )}
        disabled={isLoading}
        loading={isLoading}
        onClick={onSubmitted}
      >
        Post
      </Button>
    </span>
  );
}
