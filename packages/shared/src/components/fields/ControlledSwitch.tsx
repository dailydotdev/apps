import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from './Switch';

type ControlledSwitchProps = {
  name: string;
  label: string;
  description?: string | React.ReactNode;
  disabled?: boolean;
};

const ControlledSwitch = ({
  name,
  label,
  description,
  disabled,
}: ControlledSwitchProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col gap-1">
          <div className="flex flex-row justify-between gap-3">
            <Typography bold type={TypographyType.Body}>
              {label}
            </Typography>
            <Switch
              inputId={field.name}
              name={field.name}
              checked={field.value ?? false}
              onToggle={() => field.onChange(!field.value)}
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
      )}
    />
  );
};

export default ControlledSwitch;
