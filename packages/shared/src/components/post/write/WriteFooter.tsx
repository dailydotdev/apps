import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Switch } from '../../fields/Switch';
import { Button } from '../../buttons/Button';
import { useNotificationToggle } from '../../../hooks/notifications';
import useSidebarRendered from '../../../hooks/useSidebarRendered';

interface WriteFooterProps {
  isLoading?: boolean;
}

export function WriteFooter({ isLoading }: WriteFooterProps): ReactElement {
  const { sidebarRendered } = useSidebarRendered();
  const { shouldShowCta, isEnabled, onToggle, onSubmitted } =
    useNotificationToggle();

  return (
    <span
      className={classNames(
        'relative flex flex-col tablet:flex-row items-center',
        !sidebarRendered && 'justify-center',
        shouldShowCta && 'mt-1',
      )}
    >
      {shouldShowCta && (
        <Switch
          data-testId="push_notification-switch"
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
        <div className="tablet:hidden absolute -left-4 mt-1 h-px w-[calc(100%+2rem)] bg-theme-divider-tertiary" />
      )}
      <Button
        type="submit"
        className={classNames(
          'tablet:mt-0 ml-auto w-full tablet:w-32 btn-primary-cabbage',
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
