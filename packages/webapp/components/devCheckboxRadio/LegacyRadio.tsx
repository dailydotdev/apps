import type { InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import ConditionalWrapper from '@dailydotdev/shared/src/components/ConditionalWrapper';
import styles from './LegacyRadioItem.module.css';

// Frozen snapshot of the previous Radio design, used only by the
// /dev/checkbox-radio review page. Do not use in production code.

interface ItemClassName {
  wrapper?: string;
  content?: string;
}

export interface LegacyRadioItemProps<T extends string = string>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  value?: T;
  label?: ReactNode;
  className?: ItemClassName;
  afterElement?: ReactNode;
  reverse?: boolean;
}

function LegacyRadioItem<T extends string>({
  children,
  className = {},
  checked,
  disabled,
  afterElement,
  reverse,
  ...props
}: LegacyRadioItemProps<T>): ReactElement {
  const { id } = props;
  return (
    <ConditionalWrapper
      condition={!!className?.wrapper}
      wrapper={(component) => (
        <div className={classNames('flex flex-col', className?.wrapper)}>
          {component}
        </div>
      )}
    >
      <label
        className={classNames(
          styles.item,
          { [styles.checked]: checked },
          disabled
            ? '!text-text-disabled'
            : 'pointer cursor-pointer text-text-tertiary focus-within:text-text-primary hover:text-text-primary',
          'relative flex select-none items-center pr-3 font-bold typo-footnote',
          reverse ? 'flex-row-reverse' : 'flex-row',
          className?.content,
        )}
        htmlFor={id}
      >
        <input
          type="radio"
          className="absolute h-0 w-0 opacity-0"
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <span
          className={classNames(
            'h-8 w-8 rounded-10 p-1.5',
            reverse ? 'ml-1.5' : 'mr-1.5',
            !disabled && styles.checkmark,
          )}
        >
          <span
            className={classNames(
              'flex h-full w-full rounded-full border-2 ',
              disabled && '!border-surface-disabled !bg-surface-disabled',
              styles.innerRing,
            )}
          />
        </span>
        {children}
      </label>
      {afterElement}
    </ConditionalWrapper>
  );
}

export interface LegacyClassName {
  container?: string;
  content?: string;
  label?: string;
}

export interface LegacyRadioProps<T extends string = string> {
  name: string;
  options: LegacyRadioItemProps<T>[];
  value?: T;
  onChange: (value: T) => unknown;
  className?: LegacyClassName;
  disabled?: boolean;
  reverse?: boolean;
  valid?: boolean;
}

export function LegacyRadio<T extends string = string>({
  name,
  options,
  value,
  onChange,
  className = {},
  disabled,
  reverse,
  valid,
}: LegacyRadioProps<T>): ReactElement {
  return (
    <div
      className={classNames(
        'flex flex-col items-start gap-1',
        className.container,
      )}
    >
      {options.map((option) => (
        <LegacyRadioItem
          {...option}
          key={option.value}
          name={name}
          id={`${name}-${option.id || option.value}`}
          value={option.value}
          disabled={option.disabled || disabled}
          checked={value === option.value}
          onChange={() => option.value !== undefined && onChange(option.value)}
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
        </LegacyRadioItem>
      ))}
    </div>
  );
}
