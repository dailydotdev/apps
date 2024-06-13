import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { RadioItem, RadioItemProps } from './RadioItem';
import { TooltipPosition } from '../tooltips/BaseTooltipContainer';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';

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
  tooltip?: {
    placement?: TooltipPosition;
    content?: string;
  };
  disabled?: boolean;
}

export function Radio<T extends string = string>({
  name,
  options,
  value,
  onChange,
  className = {},
  tooltip,
  disabled,
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
        >
          <SimpleTooltip
            content={tooltip?.content}
            placement={tooltip?.placement}
          >
            <span>{option.label}</span>
          </SimpleTooltip>
        </RadioItem>
      ))}
    </div>
  );
}
