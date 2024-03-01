import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { RadioItem } from './RadioItem';

export interface RadioOption<T = string> {
  label: ReactNode;
  value: T;
  id?: string;
  afterElement?: ReactNode;
  disabled?: boolean;
}

interface ClassName {
  container?: string;
  content?: string;
}

export interface RadioProps<T extends string = string> {
  name: string;
  options: RadioOption<T>[];
  value?: T;
  onChange: (value: T) => unknown;
  className?: ClassName;
}

export function Radio<T extends string = string>({
  name,
  options,
  value,
  onChange,
  className = {},
}: RadioProps<T>): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-start gap-1',
        className.container,
      )}
    >
      {options.map((option) => (
        <RadioItem
          key={option.value}
          name={name}
          id={`${name}-${option.id || option.value}`}
          value={option.value}
          disabled={option.disabled}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className={classNames('truncate', className.content)}
          afterElement={option.afterElement}
        >
          {option.label}
        </RadioItem>
      ))}
    </div>
  );
}
