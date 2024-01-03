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
        'group relative flex items-center',
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
        className="absolute h-0 w-0 opacity-0"
      />
      <span
        className={classNames(
          'relative block',
          compact ? 'h-4 w-8' : 'h-5 w-10',
        )}
      >
        <span
          className={classNames(
            'absolute bottom-0 left-0 top-0 my-auto w-full bg-theme-overlay-quaternary',
            compact ? 'h-2.5 rounded-3' : 'h-3 rounded',
            styles.track,
          )}
        />
        <span
          className={classNames(
            'absolute left-0 top-0 bg-theme-label-tertiary',
            compact ? 'h-4 w-4 rounded-3' : 'h-5 w-5 rounded-md',
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
