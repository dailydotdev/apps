import type { ReactElement } from 'react';
import React from 'react';
import type { RadioItemProps } from './RadioItem';
import type { RadioProps } from './Radio';
import { Radio } from './Radio';

export interface ClassName {
  container?: string;
  content?: string;
}

export type { RadioItemProps };

export interface ToggleRadioProps<T extends string = string>
  extends Omit<RadioProps<T>, 'options' | 'value' | 'onChange'> {
  onLabel: string;
  offLabel: string;
  value: boolean;
  onToggle?: (value: boolean) => unknown;
}

export function ToggleRadio<T extends string = string>({
  onLabel,
  offLabel,
  value,
  onToggle,
  ...props
}: ToggleRadioProps<T>): ReactElement {
  const options = [
    { label: offLabel, value: 'off' },
    { label: onLabel, value: 'on' },
  ];
  const selectedValue = value ? 'on' : 'off';

  const onChange = (newValue: T) => {
    onToggle?.(newValue === 'on');
  };

  return (
    <Radio
      {...props}
      options={options}
      value={selectedValue}
      onChange={onChange}
    />
  );
}
