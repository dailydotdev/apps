import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Switch } from '../../fields/Switch';
import { useNotificationToggle } from '../../../hooks/notifications';
import useSidebarRendered from '../../../hooks/useSidebarRendered';
import { Button, ButtonColor, ButtonVariant } from '../../buttons/Button';

interface WriteFooterProps {
  isLoading?: boolean;
  className?: string;
}

export function WriteFooter({
  isLoading,
  className,
}: WriteFooterProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();

  return (
    <span
      className={classNames(
        'relative flex flex-col items-center tablet:flex-row',
        !sidebarRendered && 'justify-center',
        className,
      )}
    >
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
      {shouldShowCta && (
        <div className="absolute -left-4 mt-1 h-px w-[calc(100%+2rem)] bg-border-subtlest-tertiary tablet:hidden" />
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
