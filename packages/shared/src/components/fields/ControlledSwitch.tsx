import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Switch } from './Switch';
import type { SwitchProps } from './Switch';

type ControlledSwitchProps = Pick<
  SwitchProps,
  'name' | 'children' | 'className' | 'labelClassName' | 'compact' | 'defaultTypo'
> & {
  description?: string;
};

const ControlledSwitch = ({
  name,
  ...restProps
}: ControlledSwitchProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Switch
          inputId={field.name}
          {...restProps}
          {...field}
          checked={field.value || false}
          onToggle={() => field.onChange(!field.value)}
        />
      )}
    />
  );
};

export default ControlledSwitch;
