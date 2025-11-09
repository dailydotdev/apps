import type {
  InputHTMLAttributes,
  MutableRefObject,
  ReactElement,
  ReactNode,
} from 'react';
import React from 'react';
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

function SwitchComponent(
  {
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
  }: SwitchProps,
  ref: MutableRefObject<HTMLLabelElement>,
): ReactElement {
  return (
    <label
      className={classNames(
        className,
        'group relative flex items-center',
        disabled
          ? 'opacity-32 pointer-events-none cursor-not-allowed'
          : 'cursor-pointer',
        styles.switch,
      )}
      htmlFor={inputId}
      ref={ref}
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
            'bg-theme-overlay-quaternary absolute bottom-0 left-0 top-0 my-auto w-full',
            compact ? 'rounded-3 h-2.5' : 'rounded-4 h-3',
            styles.track,
          )}
        />
        <span
          className={classNames(
            'bg-text-tertiary absolute left-0 top-0',
            compact ? 'rounded-3 h-4 w-4' : 'rounded-6 h-5 w-5',
            styles.knob,
          )}
        />
      </span>
      {children && (
        <span
          className={classNames(
            'text-text-tertiary ml-3 font-bold',
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

export const Switch = React.forwardRef(SwitchComponent);
