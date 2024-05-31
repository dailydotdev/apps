import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RadioItem, RadioItemProps } from './RadioItem';

interface ClassName {
  container?: string;
  content?: string;
}

export type { RadioItemProps };

export interface RadioProps<T extends string = string> {
  name: string;
  options: RadioItemProps<T>[];
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
          {...option}
          key={option.value}
          name={name}
          id={`${name}-${option.id || option.value}`}
          value={option.value}
          disabled={option.disabled}
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
        >
          {option.label}
        </RadioItem>
      ))}
    </div>
  );
}
