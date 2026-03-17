import React from 'react';
import { Checkbox } from '../fields/Checkbox';
import { Typography, TypographyType } from '../typography/Typography';

interface NotificationCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

const NotificationCheckbox = ({
  id,
  label,
  checked,
  onToggle,
}: NotificationCheckboxProps) => {
  return (
    <li className="flex flex-row justify-between gap-1">
      <Typography type={TypographyType.Callout}>{label}</Typography>
      <Checkbox
        className="!px-0"
        checkmarkClassName="!mr-0"
        name={id}
        checked={checked}
        onToggleCallback={onToggle}
      />
    </li>
  );
};

export default NotificationCheckbox;
