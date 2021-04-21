import React, { InputHTMLAttributes, ReactElement } from 'react';
import styles from '../../styles/radio.module.css';
import classNames from 'classnames';

export type RadioItemProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

export default function RadioItem({
  children,
  className,
  checked,
  ...props
}: RadioItemProps): ReactElement {
  return (
    <label
      className={classNames(
        styles.item,
        { [styles.checked]: checked },
        'relative flex flex-row items-center typo-footnote text-theme-label-tertiary pointer font-bold cursor-pointer select-none hover:text-theme-label-primary focus-within:text-theme-label-primary pr-3',
        className,
      )}
    >
      <input
        type="radio"
        className="absolute w-0 h-0 opacity-0"
        checked={checked}
        {...props}
      />
      <span
        className={classNames(
          'w-8 h-8 p-1.5 rounded-10 mr-1.5',
          styles.checkmark,
        )}
      >
        <span
          className={classNames(
            'w-full h-full flex rounded-full border-2 border-theme-label-tertiary',
            styles.innerRing,
          )}
        />
      </span>
      {children}
    </label>
  );
}
