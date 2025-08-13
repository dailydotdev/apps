import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';

interface NotificationSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const NotificationSwitch = ({
  id,
  label,
  description,
  checked,
  onToggle,
  disabled,
}: NotificationSwitchProps) => {
  return (
    <div className="flex flex-row justify-between gap-1">
      <div className="flex flex-1 flex-col gap-3">
        <Typography type={TypographyType.Callout}>{label}</Typography>
        {description && (
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Footnote}
          >
            {description}
          </Typography>
        )}
      </div>
      <Switch
        inputId={id}
        name={id}
        checked={checked}
        onToggle={onToggle}
        compact={false}
        disabled={disabled}
      />
    </div>
  );
};

export default NotificationSwitch;
