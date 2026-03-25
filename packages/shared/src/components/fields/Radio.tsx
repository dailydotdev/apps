import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { RadioItemProps } from './RadioItem';
import { RadioItem } from './RadioItem';

export interface ClassName {
  container?: string;
  content?: string;
  label?: string;
}

export type { RadioItemProps };

export interface RadioProps<T extends string | undefined = string | undefined> {
  name: string;
  options: RadioItemProps<T>[];
  value?: T;
  onChange: (value: T) => unknown;
  className?: ClassName;
  disabled?: boolean;
  reverse?: boolean;
  valid?: boolean;
}

export function Radio<T extends string | undefined = string | undefined>({
  name,
  options,
  value,
  onChange,
  className = {},
  disabled,
  reverse,
  valid,
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
          {...option}
          key={option.id ?? option.value ?? String(option.label)}
          name={name}
          id={`${name}-${option.id ?? option.value ?? String(option.label)}`}
          value={option.value}
          disabled={option.disabled || disabled}
          checked={value === option.value}
          onChange={() => onChange(option.value)}
          className={{
            content: classNames(
              'truncate',
              className.content,
              option?.className?.content,
            ),
            wrapper: option.className?.wrapper,
          }}
          afterElement={option.afterElement}
          reverse={reverse}
        >
          <span
            className={classNames(
              className.label,
              valid === false && 'text-status-error',
            )}
          >
            {option.label}
          </span>
        </RadioItem>
      ))}
    </div>
  );
}
