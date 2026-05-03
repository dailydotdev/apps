import type { MouseEventHandler, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ButtonV2, ButtonSize, ButtonVariant } from '../../buttons/ButtonV2';

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
      <ButtonV2
        variant={ButtonVariant.Tertiary}
        className="absolute right-4"
        size={ButtonSize.Small}
        onClick={onActionClick}
      >
        {ctaCopy}
      </ButtonV2>
    </span>
  );
}
