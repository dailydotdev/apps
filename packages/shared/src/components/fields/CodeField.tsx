import type {
  ReactElement,
  ClipboardEventHandler,
  ChangeEvent,
  KeyboardEventHandler,
} from 'react';
import React, { useRef, useState } from 'react';
import { TextField } from './TextField';
import { ArrowKey } from '../../lib/element';

interface CodeFieldProps {
  onChange: (code: string) => void;
  length?: number;
}

const DEFAULT_LENGTH = 6;
const INVALID_KEYS = [ArrowKey.Up, ArrowKey.Down, '.'];

export function CodeField({
  onChange,
  length = DEFAULT_LENGTH,
}: CodeFieldProps): ReactElement {
  const elementsRef = useRef<HTMLInputElement[]>(Array(length).fill(null));
  const [code, setCode] = useState<string[]>(Array(length).fill(''));

  const onPaste: ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData('text');
    const sliced = text.slice(0, DEFAULT_LENGTH);
    setCode(sliced.split(''));
    onChange(sliced);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const char = e.target.value;
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    if (char.length > 0 && index < DEFAULT_LENGTH - 1) {
      const nextIndex = index + 1;

      if (elementsRef.current[nextIndex]) {
        elementsRef.current[nextIndex].focus();
      }
    }
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
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
