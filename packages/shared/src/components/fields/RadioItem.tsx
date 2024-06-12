import React, { InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './RadioItem.module.css';
import ConditionalWrapper from '../ConditionalWrapper';

interface ClassName {
  wrapper?: string;
  content?: string;
}

export interface RadioItemProps<T extends string = string>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  value?: T;
  label?: ReactNode;
  className?: ClassName;
  afterElement?: ReactNode;
}

export function RadioItem<T extends string>({
  children,
  className = {},
  checked,
  disabled,
  afterElement,
  ...props
}: RadioItemProps<T>): ReactElement {
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
          'relative flex select-none flex-row items-center pr-3 font-bold typo-footnote',
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
            'mr-1.5 h-8 w-8 rounded-10 p-1.5',
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
