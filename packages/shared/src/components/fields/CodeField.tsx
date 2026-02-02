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

  const onSlice = (text: string) => {
    const sliced = text.slice(0, length);
    setCode(sliced.split(''));
    onChange?.(sliced);

    if (sliced.length === length) {
      onSubmit(sliced);
    }
  };

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');
    const isNumbersOnly = checkIsNumbersOnly(text);

    if (!isNumbersOnly) {
      e.preventDefault();
      return;
    }

    onSlice(text);
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
      <input
        type="text"
        id="code"
        name="code"
        value={code.join('')}
        onChange={() => {}} // Controlled by the individual inputs
        autoComplete="one-time-code"
        hidden
        onInput={(e) => {
          // Handle iOS Safari autofill
          const { value } = e.target as HTMLInputElement;
          if (value && value.length === length) {
            onSlice(value);
          }
        }}
      />
      {[...Array(length)].map((_, index) => (
        <TextField
          // eslint-disable-next-line react/no-array-index-key
          key={`code-${index}`}
          type="tel"
          inputId={`code-${index}`}
          tabIndex={index + 1}
          label={null}
          maxLength={1}
          showMaxLength={false}
          className={{ baseField: '!h-11 w-11 mobileL:!h-12 mobileL:w-12' }}
          onPaste={onPaste}
          value={code[index] || ''}
          onKeyDown={(e) => onKeyDown(e, index)}
          disabled={disabled}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          inputRef={(el) => {
            if (el) {
              elementsRef.current[index] = el;
            }
          }}
        />
      ))}
    </span>
  );
}
