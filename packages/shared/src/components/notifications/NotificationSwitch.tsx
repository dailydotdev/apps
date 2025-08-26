import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import { PlusUser } from '../PlusUser';

interface NotificationSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isPlusFeature?: boolean;
}

const NotificationSwitch = ({
  id,
  label,
  description,
  checked,
  onToggle,
  disabled,
  isPlusFeature,
}: NotificationSwitchProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between gap-3">
        <div className="flex items-center gap-2">
          <Typography type={TypographyType.Callout}>{label}</Typography>
          {isPlusFeature && <PlusUser />}
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
      {description && (
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          {description}
        </Typography>
      )}
    </div>
  );
};

export default NotificationSwitch;
