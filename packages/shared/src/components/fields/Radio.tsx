import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RadioItem } from './RadioItem';

export interface RadioOption<T = string> {
  label: string;
  value: T;
  id?: string;
}

export type RadioProps = {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => unknown;
  className?: string;
};

export function Radio({
  name,
  options,
  value,
  onChange,
  className,
}: RadioProps): ReactElement {
  return (
    <div className={classNames('flex flex-col -my-0.5 items-start', className)}>
      {options.map((option) => (
        <RadioItem
          key={option.value}
          name={name}
          id={option.id || option.value}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className="my-0.5 truncate"
        >
          {option.label}
        </RadioItem>
      ))}
    </div>
  );
}
