import type { ReactElement, ReactNode } from 'react';
import React, { useId, useState } from 'react';
import classNames from 'classnames';
import styles from './LegacyField.module.css';

/**
 * Self-contained snapshot of the PREVIOUS TextField design — surface-float base
 * with the left-edge accent bar on hover / focus / invalid. Kept ONLY for the
 * before/after comparison story. Do not use in production code.
 */
export interface LegacyTextFieldProps {
  inputId?: string;
  label: string;
  placeholder?: string;
  fieldType?: 'primary' | 'secondary' | 'tertiary';
  defaultValue?: string;
  invalid?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  leftIcon?: ReactNode;
  actionButton?: ReactNode;
  hint?: string;
  passwordLevel?: number;
  type?: string;
  className?: string;
}

export function LegacyTextField({
  inputId,
  label,
  placeholder,
  fieldType = 'primary',
  defaultValue = '',
  invalid,
  disabled,
  readOnly,
  leftIcon,
  actionButton,
  hint,
  passwordLevel,
  type,
  className,
}: LegacyTextFieldProps): ReactElement {
  const generatedId = useId();
  const id = inputId ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const hasValue = value.length > 0;

  const isPrimary = fieldType === 'primary';
  const isSecondary = fieldType === 'secondary';
  const isTertiary = fieldType === 'tertiary';

  const resolvePlaceholder = (): string => {
    if (isTertiary) {
      return focused ? placeholder ?? '' : label;
    }
    if (focused || isSecondary) {
      return placeholder ?? '';
    }
    return label;
  };

  const fontColor = (() => {
    if (disabled) {
      return 'text-text-disabled';
    }
    if (hasValue) {
      return 'text-text-primary';
    }
    if (readOnly) {
      return 'text-text-quaternary';
    }
    return 'text-text-tertiary';
  })();

  return (
    <div className={classNames('flex flex-col', className)}>
      {isSecondary && (
        <label
          className="mb-1 px-2 font-bold text-text-tertiary typo-caption1"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div
        className={classNames(
          'relative flex flex-row items-center overflow-hidden border border-transparent bg-surface-float px-4 cursor-text',
          isSecondary ? 'h-9 rounded-10' : 'h-12 rounded-14',
          leftIcon && 'pl-3',
          actionButton && 'pr-3',
          styles.field,
          {
            focused,
            invalid,
          },
          passwordLevel === 3 && 'password-3',
          disabled && 'pointer-events-none opacity-32',
        )}
      >
        {leftIcon && <span className="mr-2 text-text-tertiary">{leftIcon}</span>}
        <div className="flex max-w-full flex-1 flex-col items-start">
          {isPrimary && (focused || hasValue) && (
            <label
              className="text-text-tertiary typo-caption1"
              htmlFor={id}
            >
              {label}
            </label>
          )}
          <input
            id={id}
            type={type}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={resolvePlaceholder()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setValue(e.target.value)}
            className={classNames(
              'min-w-0 self-stretch bg-transparent text-ellipsis caret-text-link typo-body focus:outline-none',
              fontColor,
            )}
          />
        </div>
        {actionButton}
      </div>
      {hint && (
        <div
          className={classNames(
            'mt-1 flex items-center gap-1 px-2 typo-caption1',
            invalid ? 'text-status-error' : 'text-text-quaternary',
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
