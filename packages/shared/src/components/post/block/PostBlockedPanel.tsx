import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize } from '../../buttons/Button';

interface PostBlockedPanelProps {
  blockedTags: number;
  className?: string;
}

export function PostBlockedPanel({
  blockedTags,
  className,
}: PostBlockedPanelProps): ReactElement {
  const getMessage = () => {
    if (blockedTags === 0) return 'No topics blocked';

    const topic =
      blockedTags === 1 ? 'topic was blocked' : 'topics are now blocked';

    return `${blockedTags} ${topic}`;
  };

  return (
    <span
      className={classNames(
        'flex relative flex-row items-center p-4 rounded-16 border border-theme-divider-tertiary',
        className,
      )}
    >
      {getMessage()}
      <Button
        className="right-4 btn-tertiary"
        position="absolute"
        buttonSize={ButtonSize.Small}
      >
        {blockedTags > 0 ? 'Undo' : `Don't ask again`}
      </Button>
    </span>
  );
}
