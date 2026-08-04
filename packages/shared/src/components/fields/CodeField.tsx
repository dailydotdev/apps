import type { ChangeEvent, ReactElement, SyntheticEvent } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { BaseField } from './common';

interface CodeFieldProps {
  onChange?: (code: string) => void;
  onSubmit: (code: string) => void;
  length?: number;
  disabled?: boolean;
  defaultValue?: string;
}

const DEFAULT_LENGTH = 6;

const toDigits = (value: string, length: number): string =>
  value.replace(/\D/g, '').slice(0, length);

export function CodeField({
  disabled,
  onChange,
  onSubmit,
  defaultValue = '',
  length = DEFAULT_LENGTH,
}: CodeFieldProps): ReactElement {
  const submittedRef = useRef<string | null>(null);
  const [code, setCode] = useState(() => toDigits(defaultValue, length));
  const [isFocused, setIsFocused] = useState(false);
  const caretIndex = Math.min(code.length, length - 1);

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = toDigits(e.target.value, length);
    setCode(digits);
    onChange?.(digits);

    if (digits.length < length) {
      submittedRef.current = null;
      return;
    }

    // AutoFill can deliver a single insertion as two change events.
    if (submittedRef.current === digits) {
      return;
    }

    submittedRef.current = digits;
    onSubmit(digits);
  };

  // A caret left mid-string would scramble the order of the digits after it.
  const keepCaretAtEnd = (e: SyntheticEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const end = input.value.length;

    if (input.selectionStart === end && input.selectionEnd === end) {
      return;
    }

    input.setSelectionRange(end, end);
  };

  return (
    <div className="relative flex flex-row gap-2">
      {Array.from({ length }, (_, index) => (
        <BaseField
          aria-hidden
          // eslint-disable-next-line react/no-array-index-key
          key={`code-${index}`}
          className={classNames(
            'h-11 w-11 items-center justify-center rounded-14 !px-0 text-text-primary typo-body mobileL:h-12 mobileL:w-12',
            disabled && 'opacity-32',
            isFocused && index === caretIndex && 'focused',
          )}
        >
          {code[index] ?? ''}
        </BaseField>
      ))}
      {/* iOS only offers a code to the focused field carrying the hint, refuses
          to fill hidden fields, and zooms on fonts under 16px; browsers cut a
          paste to `maxLength` before the digits could be sliced out — hence one
          visible-but-transparent input over the whole row, with no cap. */}
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        aria-label="Verification code"
        autoComplete="one-time-code"
        className="absolute inset-0 z-1 h-full w-full bg-transparent text-transparent caret-transparent typo-body focus:outline-none"
        disabled={disabled}
        id="code"
        inputMode="numeric"
        name="code"
        onBlur={() => setIsFocused(false)}
        onChange={onInputChange}
        onFocus={(e) => {
          setIsFocused(true);
          keepCaretAtEnd(e);
        }}
        onSelect={keepCaretAtEnd}
        pattern="[0-9]*"
        type="text"
        value={code}
      />
    </div>
  );
}
