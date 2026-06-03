import type { ReactElement } from 'react';
import React, { useId, useState } from 'react';
import classNames from 'classnames';
import styles from './LegacyField.module.css';

/**
 * Self-contained snapshot of the PREVIOUS Textarea design — surface-float base
 * with no resting border and the left-edge accent bar on focus / invalid. Kept
 * ONLY for the before/after comparison story. Do not use in production code.
 */
export interface LegacyTextareaProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  invalid?: boolean;
  disabled?: boolean;
  hint?: string;
  rows?: number;
  maxLength?: number;
}

export function LegacyTextarea({
  label,
  placeholder,
  defaultValue = '',
  invalid,
  disabled,
  hint,
  rows = 3,
  maxLength = 100,
}: LegacyTextareaProps): ReactElement {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const hasValue = value.length > 0;

  return (
    <div className="flex flex-col">
      <div
        className={classNames(
          'relative flex flex-col overflow-hidden rounded-14 border border-transparent bg-surface-float px-4 pt-1 cursor-text',
          styles.field,
          { focused, invalid },
          disabled && 'pointer-events-none opacity-32',
        )}
      >
        {(focused || hasValue) && (
          <label className="text-text-tertiary typo-caption1" htmlFor={id}>
            {label}
          </label>
        )}
        <textarea
          id={id}
          rows={rows}
          value={value}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={focused ? placeholder ?? '' : label}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => setValue(e.target.value)}
          className={classNames(
            'w-full min-w-0 resize-none self-stretch bg-transparent caret-text-link typo-body focus:outline-none',
            hasValue ? 'text-text-primary' : 'text-text-tertiary',
          )}
        />
        <span className="ml-auto py-2 text-text-quaternary typo-caption1">
          {`${value.length}/${maxLength}`}
        </span>
      </div>
      {hint && (
        <div
          className={classNames(
            'mt-1 px-2 typo-caption1',
            invalid ? 'text-status-error' : 'text-text-quaternary',
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
