import { Controller, useFormContext } from 'react-hook-form';
import React from 'react';
import type { TextFieldProps } from './TextField';
import { TextField } from './TextField';

type ControlledTextFieldProps = Pick<
  TextFieldProps,
  'name' | 'label' | 'leftIcon' | 'placeholder'
>;

const ControlledTextField = ({
  name,
  ...restProps
}: ControlledTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          inputId={field.name}
          {...restProps}
          {...field}
          valid={!fieldState.error}
        />
      )}
    />
  );
};
export default ControlledTextField;
