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
  description?: string | React.ReactNode;
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
          <Typography id={`${id}-label`} type={TypographyType.Callout}>
            {label}
          </Typography>
          {isPlusFeature && <PlusUser />}
        </div>
        <Switch
          inputId={id}
          name={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={description ? `${id}-description` : undefined}
          checked={checked}
          onToggle={onToggle}
          compact={false}
          disabled={disabled}
        />
      </div>
      {description && (
        <Typography
          id={`${id}-description`}
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
