import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { RadioItem } from './RadioItem';

export interface RadioOption<T = string> {
  label: ReactNode;
  value: T;
  id?: string;
}

interface ClassName {
  container?: string;
  content?: string;
}

export type RadioProps = {
  name: string;
  options: RadioOption[];
  value?: string;
  onChange: (value: string) => unknown;
  className?: ClassName;
};

export function Radio({
  name,
  options,
  value,
  onChange,
  className = {},
}: RadioProps): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col -my-0.5 items-start',
        className.container,
      )}
    >
      {options.map((option) => (
        <RadioItem
          key={option.value}
          name={name}
          id={`${name}-${option.id || option.value}`}
          value={option.value}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className={classNames('my-0.5 truncate', className.content)}
        >
          {option.label}
        </RadioItem>
      ))}
    </div>
  );
}
