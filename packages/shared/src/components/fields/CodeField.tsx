import type {
  ReactElement,
  ClipboardEventHandler,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import React, { useRef, useState } from 'react';
import { TextField } from './TextField';
import { ArrowKey } from '../../lib/element';

interface CodeFieldProps {
  onChange: (code: string) => void;
  length?: number;
  disabled?: boolean;
}

const DEFAULT_LENGTH = 6;
const INVALID_KEYS = [ArrowKey.Up, ArrowKey.Down, '.'];

export function CodeField({
  disabled,
  onChange,
  length = DEFAULT_LENGTH,
}: CodeFieldProps): ReactElement {
  const elementsRef = useRef<HTMLInputElement[]>(Array(length).fill(null));
  const [code, setCode] = useState<string[]>(Array(length).fill(''));

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');
    const isNumbersOnly = /^\d+$/.test(text);

    if (!isNumbersOnly) {
      e.preventDefault();
      return;
    }

    const sliced = text.slice(0, DEFAULT_LENGTH);
    setCode(sliced.split(''));
    onChange(sliced);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value;
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    if (char.length > 0) {
      if (index < DEFAULT_LENGTH - 1) {
        const nextIndex = index + 1;

        if (elementsRef.current[nextIndex]) {
          elementsRef.current[nextIndex].focus();
        }
      }
    } else if (index > 0) {
      const previous = index - 1;

      if (elementsRef.current[previous]) {
        elementsRef.current[previous].focus();
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (INVALID_KEYS.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <span className="flex flex-row gap-2">
      {[...Array(DEFAULT_LENGTH)].map((_, index) => (
        <TextField
          // eslint-disable-next-line react/no-array-index-key
          key={`code-${index}`}
          inputId={`code-${index}`}
          tabIndex={index + 1}
          label={null}
          type="number"
          min={0}
          max={9}
          showMaxLength={false}
          className={{ container: 'w-12' }}
          onPaste={index === 0 && onPaste}
          value={code[index] || ''}
          onChange={(e) => onInputChange(e, index)}
          onKeyDown={onKeyDown}
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
