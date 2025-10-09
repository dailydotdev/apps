import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import MarkdownInput from '.';

const ControlledMarkdownInput = ({
  name,
  rules,
  ...props
}: {
  name: string;
  rules?: Record<string, unknown>;
} & React.ComponentProps<typeof MarkdownInput>) => {
  const { control, setValue } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <MarkdownInput
          {...field}
          onValueUpdate={(value) => setValue(name, value)}
          {...props}
        />
      )}
    />
  );
};

export default ControlledMarkdownInput;
