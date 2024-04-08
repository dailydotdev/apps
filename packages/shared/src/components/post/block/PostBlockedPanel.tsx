import React, { MouseEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';

interface PostBlockedPanelProps {
  className?: string;
  onActionClick: MouseEventHandler;
  message: string;
  ctaCopy: string;
}

export function PostBlockedPanel({
  className,
  onActionClick,
  message,
  ctaCopy,
}: PostBlockedPanelProps): ReactElement {
  return (
    <span
      className={classNames(
        'relative flex flex-row items-center rounded-16 border border-border-subtlest-tertiary p-4',
        className,
      )}
    >
      {message}
      <Button
        variant={ButtonVariant.Tertiary}
        className="absolute right-4"
        size={ButtonSize.Small}
        onClick={onActionClick}
      >
        {ctaCopy}
      </Button>
    </span>
  );
}
