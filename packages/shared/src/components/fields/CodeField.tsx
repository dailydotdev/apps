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
    onChange(newCode.join(''));

    const finalCode = newCode.join('');

    if (finalCode.length === DEFAULT_LENGTH && index === DEFAULT_LENGTH - 1) {
      onSubmit(finalCode);
    }
  };

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');
    const isNumbersOnly = checkIsNumbersOnly(text);

    if (!isNumbersOnly) {
      e.preventDefault();
      return;
    }

    const sliced = text.slice(0, DEFAULT_LENGTH);
    setCode(sliced.split(''));
    onChange?.(sliced);

    if (sliced.length === DEFAULT_LENGTH) {
      onSubmit(sliced);
    }
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
      updateCode(key, index);

      if (index < DEFAULT_LENGTH - 1) {
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
        hidden
        readOnly
      />
      {[...Array(DEFAULT_LENGTH)].map((_, index) => (
        <TextField
          // eslint-disable-next-line react/no-array-index-key
          key={`code-${index}`}
          type="tel"
          inputId={`code-${index}`}
          tabIndex={index + 1}
          label={null}
          maxLength={1}
          showMaxLength={false}
          className={{ container: 'w-12' }}
          onPaste={index === 0 ? onPaste : undefined}
          value={code[index] || ''}
          onKeyDown={(e) => onKeyDown(e, index)}
          disabled={disabled}
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
