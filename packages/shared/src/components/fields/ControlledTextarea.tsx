import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Textarea from './Textarea';
import type { BaseFieldProps } from './BaseFieldContainer';

const ControlledTextarea = ({
  name,
  ...restProps
}: Pick<
  BaseFieldProps<HTMLTextAreaElement>,
  'name' | 'label' | 'maxLength'
>) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Textarea
          inputId={field.name}
          {...restProps}
          {...field}
          valid={!fieldState.error}
        />
      )}
    />
  );
};

export default ControlledTextarea;
