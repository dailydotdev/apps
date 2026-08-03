import type { ReactElement, ClipboardEventHandler, KeyboardEvent } from 'react';
import React, { useRef, useState } from 'react';
import { TextField } from './TextField';
import { ArrowKey, KeyboardCommand } from '../../lib/element';
import { checkIsNumbersOnly } from '../../lib';
import { nextTick } from '../../lib/func';

interface CodeFieldProps {
  onChange?: (code: string) => void;
  onSubmit: (code: string) => void;
  length?: number;
  disabled?: boolean;
  hint?: string;
}

const DEFAULT_LENGTH = 6;
const INVALID_KEYS = [ArrowKey.Up, ArrowKey.Down, '.'];

export function CodeField({
  disabled,
  onChange,
  onSubmit,
  length = DEFAULT_LENGTH,
}: CodeFieldProps): ReactElement {
  const elementsRef = useRef<HTMLInputElement[]>(
    Array(Math.max(0, length)).fill(null),
  );
  const [code, setCode] = useState<string[]>(
    Array(Math.max(0, length)).fill(''),
  );

  const updateCode = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    onChange?.(newCode.join(''));

    const finalCode = newCode.join('');

    if (finalCode.length === length && index === length - 1) {
      onSubmit(finalCode);
    }
  };

  // A code copied out of an email drags the selection's whitespace and prose
  // along with it, so take the digits rather than rejecting the whole paste.
  const onSlice = (text: string) => {
    const sliced = text.replace(/\D/g, '').slice(0, length);

    if (!sliced) {
      return;
    }

    setCode(sliced.split(''));
    onChange?.(sliced);

    if (sliced.length === length) {
      onSubmit(sliced);
    }
  };

  // Only ever sees platform-written values — iOS AutoFill, or Gboard's
  // clipboard chip, which inserts as text and fires no paste event. Typed
  // digits are handled and cancelled in `onKeyDown`.
  const onFill = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');

    if (digits.length > 1) {
      onSlice(digits);
      return;
    }

    updateCode(digits, index);
  };

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    onSlice(e.clipboardData.getData('text'));
  };

  const onKeyDown = async (
    e: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    const { key } = e;
    const isNumbersOnly = checkIsNumbersOnly(key);

    if ((e.ctrlKey || e.metaKey) && key === 'v') {
      return;
    }

    if (key === KeyboardCommand.Enter) {
      onSubmit(code.join(''));
      return;
    }

    if (INVALID_KEYS.includes(key)) {
      e.preventDefault();
    }

    if (key === KeyboardCommand.Backspace) {
      updateCode('', index);

      if (index <= 0) {
        return;
      }

      const previous = index - 1;

      if (elementsRef.current[previous]) {
        await nextTick();
        elementsRef.current[previous].focus();
      }
    }

    if (!isNumbersOnly) {
      e.preventDefault();
    } else if (key.length === 1) {
      e.preventDefault();
      updateCode(key, index);

      if (index < length - 1) {
        const nextIndex = index + 1;

        if (elementsRef.current[nextIndex]) {
          await nextTick();
          elementsRef.current[nextIndex].focus();
        }
      }
    }
  };

  return (
    <span className="flex flex-row gap-2">
      {/* The platform only offers a code to the field it has focused, so the
          hint rides on the box that takes focus rather than a hidden mirror of
          it, `text` + `inputMode` is the pair Safari documents AutoFill
          against, and no box takes `maxLength` — a whole code written into one
          would be cut to a digit. */}
      {[...Array(length)].map((_, index) => {
        const isAutofillTarget = index === 0;

        return (
          <TextField
            // eslint-disable-next-line react/no-array-index-key
            key={`code-${index}`}
            type="text"
            inputId={`code-${index}`}
            tabIndex={index + 1}
            label=""
            {...(isAutofillTarget
              ? { autoComplete: 'one-time-code', name: 'code' }
              : { autoComplete: 'off' })}
            className={{ baseField: '!h-11 w-11 mobileL:!h-12 mobileL:w-12' }}
            onPaste={onPaste}
            value={code[index] || ''}
            onChange={(e) => onFill(e.target.value, index)}
            onKeyDown={(e) => onKeyDown(e, index)}
            disabled={disabled}
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus={isAutofillTarget}
            inputRef={(el) => {
              if (el) {
                elementsRef.current[index] = el;
              }
            }}
          />
        );
      })}
    </span>
  );
}
