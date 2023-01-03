import React, { InputHTMLAttributes, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import styles from './Switch.module.css';

export interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: ReactNode;
  className?: string;
  labelClassName?: string;
  inputId: string;
  name: string;
  checked?: boolean;
  onToggle?: () => unknown;
  compact?: boolean;
  defaultTypo?: boolean;
}

export function Switch({
  className,
  labelClassName,
  inputId,
  name,
  checked,
  children,
  onToggle,
  compact = true,
  defaultTypo = true,
  disabled,
  ...props
}: SwitchProps): ReactElement {
  return (
    <label
      className={classNames(
        className,
        'relative flex items-center group',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        styles.switch,
      )}
      htmlFor={inputId}
    >
      <input
        {...props}
        disabled={disabled}
        id={inputId}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="absolute w-0 h-0 opacity-0"
      />
      <span
        className={classNames(
          'relative block',
          compact ? 'w-8 h-4' : 'w-10 h-5',
        )}
      >
        <span
          className={classNames(
            'absolute left-0 top-0 bottom-0 w-full my-auto bg-theme-overlay-quaternary',
            compact ? 'h-2.5 rounded-3' : 'h-3 rounded',
            styles.track,
          )}
        />
        <span
          className={classNames(
            'absolute left-0 top-0 bg-theme-label-tertiary',
            compact ? 'w-4 h-4 rounded-3' : 'w-5 h-5 rounded-md',
            styles.knob,
          )}
        />
      </span>
      {children && (
        <span
          className={classNames(
            'ml-3 font-bold text-theme-label-tertiary',
            defaultTypo && 'typo-footnote',
            styles.children,
            labelClassName,
          )}
        >
          {children}
        </span>
      )}
    </label>
  );
}
