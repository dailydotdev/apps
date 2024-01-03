import React, { InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './RadioItem.module.css';

export type RadioItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> & {
  afterElement?: ReactNode;
};

export function RadioItem({
  children,
  className,
  checked,
  disabled,
  afterElement,
  ...props
}: RadioItemProps): ReactElement {
  const { id } = props;
  return (
    <>
      <label
        className={classNames(
          styles.item,
          { [styles.checked]: checked },
          disabled
            ? 'text-theme-label-disabled'
            : 'pointer cursor-pointer text-theme-label-tertiary focus-within:text-theme-label-primary hover:text-theme-label-primary',
          'relative flex select-none flex-row items-center pr-3 font-bold typo-footnote',
          className,
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
              !disabled && 'border-theme-label-tertiary',
              styles.innerRing,
            )}
          />
        </span>
        {children}
      </label>
      {afterElement}
    </>
  );
}
