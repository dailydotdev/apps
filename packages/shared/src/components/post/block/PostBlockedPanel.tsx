import React, { MouseEventHandler, ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../../buttons/Button';
import { DownvoteBlocked, getBlockedLength, getBlockedMessage } from './common';

interface PostBlockedPanelProps {
  blocked: DownvoteBlocked;
  className?: string;
  onActionClick: MouseEventHandler;
}

export function PostBlockedPanel({
  blocked,
  className,
  onActionClick,
}: PostBlockedPanelProps): ReactElement {
  return (
    <span
      className={classNames(
        'flex relative flex-row items-center p-4 rounded-16 border border-theme-divider-tertiary',
        className,
      )}
    >
      {getBlockedMessage(blocked)}
      <Button
        className="right-4 btn-tertiary"
        position="absolute"
        buttonSize={ButtonSize.Small}
        onClick={onActionClick}
      >
        {getBlockedLength(blocked) > 0 ? 'Undo' : `Don't ask again`}
      </Button>
    </span>
  );
}
