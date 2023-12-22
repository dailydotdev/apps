import React, { MouseEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/ButtonV2';

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
        'flex relative flex-row items-center p-4 rounded-16 border border-theme-divider-tertiary',
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
