import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Switch } from '../fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { EyeIcon } from '../icons';
import { IconSize } from '../Icon';

export interface ProfilePreviewToggleProps {
  isPreviewMode: boolean;
  onToggle: () => void;
  className?: string;
}

export function ProfilePreviewToggle({
  isPreviewMode,
  onToggle,
  className,
}: ProfilePreviewToggleProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex items-start gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <EyeIcon
          size={IconSize.Medium}
          className="shrink-0 text-text-tertiary"
          secondary
        />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Typography type={TypographyType.Body} bold>
            Preview mode
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            className="break-words"
          >
            See how your profile looks to others
          </Typography>
        </div>
      </div>
      <Switch
        inputId="profile-preview-toggle"
        name="profilePreview"
        checked={isPreviewMode}
        onToggle={onToggle}
        compact={false}
        className="shrink-0 self-center"
        aria-label="Preview mode"
      />
    </div>
  );
}
