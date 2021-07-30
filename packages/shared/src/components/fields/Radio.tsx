import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RadioItem } from './RadioItem';

export type RadioProps = {
  name: string;
  options: { label: string; value: string }[];
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
