import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { BulletListIcon } from '../../icons';
import { Tooltip } from '../../tooltip/Tooltip';

interface ScheduledPostsNavButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  // Shows a text label next to the icon, so the list link is not mistaken for
  // the calendar control that actually schedules the post.
  showLabel?: boolean;
}

export function ScheduledPostsNavButton({
  onClick,
  disabled,
  className,
  showLabel,
}: ScheduledPostsNavButtonProps): ReactElement {
  return (
    <Tooltip content="Scheduled posts">
      <Button
        type="button"
        size={ButtonSize.Small}
        variant={ButtonVariant.Tertiary}
        icon={<BulletListIcon />}
        onClick={onClick}
        disabled={disabled}
        className={className}
        aria-label="Scheduled posts"
      >
        {showLabel ? 'Scheduled' : undefined}
      </Button>
    </Tooltip>
  );
}
