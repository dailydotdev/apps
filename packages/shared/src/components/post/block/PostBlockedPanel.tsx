import React, { MouseEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../../buttons/Button';

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
        'relative flex flex-row items-center rounded-16 border border-theme-divider-tertiary p-4',
        className,
      )}
    >
      {message}
      <Button
        className="btn-tertiary right-4"
        position="absolute"
        buttonSize={ButtonSize.Small}
        onClick={onActionClick}
      >
        {ctaCopy}
      </Button>
    </span>
  );
}
