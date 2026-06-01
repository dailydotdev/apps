import type {
  ForwardedRef,
  InputHTMLAttributes,
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
    'aria-label': ariaLabel,
    ...props
  }: SwitchProps,
  ref: ForwardedRef<HTMLLabelElement>,
): ReactElement {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      className={classNames(
        className,
        'group relative flex items-center',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        styles.switch,
        disabled && styles.disabled,
      )}
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
      <span className="relative block h-6 w-11">
        <span
          className={classNames('absolute inset-0 rounded-8', styles.track)}
        />
        <span
          className={classNames(
            'absolute inset-0.5 rounded-6',
            styles.hoverLayer,
          )}
        />
        <span
          className={classNames(
            'pointer-events-none absolute inset-0 rounded-8 border-2 border-solid',
            styles.focusRing,
          )}
        />
        <span
          className={classNames(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-6',
            styles.knob,
          )}
        />
      </span>
      {children ? (
        <span
          className={classNames(
            'ml-3 font-medium antialiased',
            defaultTypo && (compact ? 'typo-footnote' : 'typo-callout'),
            styles.children,
            labelClassName,
          )}
        >
          {children}
        </span>
      ) : (
        ariaLabel && <span className="sr-only">{ariaLabel}</span>
      )}
    </label>
  );
}

export const Switch = React.forwardRef(SwitchComponent);
