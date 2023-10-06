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
            : 'text-theme-label-tertiary pointer hover:text-theme-label-primary focus-within:text-theme-label-primary cursor-pointer',
          'relative flex flex-row items-center typo-footnote font-bold select-none pr-3',
          className,
        )}
        htmlFor={id}
      >
        <input
          type="radio"
          className="absolute w-0 h-0 opacity-0"
          checked={checked}
          disabled={disabled}
          {...props}
        />
        <span
          className={classNames(
            'w-8 h-8 p-1.5 rounded-10 mr-1.5',
            !disabled && styles.checkmark,
          )}
        >
          <span
            className={classNames(
              'w-full h-full flex rounded-full border-2 ',
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
