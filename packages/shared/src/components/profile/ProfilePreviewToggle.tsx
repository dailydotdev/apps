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
        'flex items-center justify-between rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <EyeIcon
          size={IconSize.Medium}
          className="text-text-tertiary"
          secondary
        />
        <div className="flex flex-col gap-0.5">
          <Typography type={TypographyType.Body} bold>
            Preview mode
          </Typography>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
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
      />
    </div>
  );
}
