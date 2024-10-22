import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';

const limit = 8;
const list = Array(limit).fill(0);

interface LinksFormProps {
  links: string[];
  isFormReadonly?: boolean;
  errors?: Record<string | number, string>;
}

const validateUrl = (input: string): boolean => {
  const validator = document.createElement('input');
  validator.type = 'url';
  validator.value = input;

  return input === '' || validator.checkValidity();
};

export function LinksForm({
  links,
  isFormReadonly,
}: LinksFormProps): ReactElement {
  const [validInputs, setValidInputs] = useState<Record<number, boolean>>({});
  const validationTimeoutRef = useRef<{
    [key: number]: ReturnType<typeof setTimeout>;
  }>({});

  useEffect(() => {
    const timeoutRefs = validationTimeoutRef.current;
    return () => {
      Object.values(timeoutRefs).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const onChange = (i: number, value: string) => {
    if (validationTimeoutRef.current[i]) {
      clearTimeout(validationTimeoutRef.current[i]);
    }
    validationTimeoutRef.current[i] = setTimeout(() => {
      const isValid = validateUrl(value);
      setValidInputs((state) => {
        if (state[i] === isValid) {
          return state;
        }
        return { ...state, [i]: isValid };
      });
    }, 300);
  };

  return (
    <div className="flex flex-col gap-4">
      {list.map((_, i) => (
        <TextField
          name="shortcutLink"
          inputId={`shortcutLink-${i}`}
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          type="url"
          autoComplete="off"
          fieldType="tertiary"
          label="Add shortcuts"
          value={links[i]}
          valid={validInputs[i] !== false}
          hint={validInputs[i] === false ? 'Must be a valid HTTP/S link' : ''}
          readOnly={isFormReadonly}
          onChange={(e) => onChange(i, e.target.value)}
          placeholder="http://example.com"
        />
      ))}
    </div>
  );
}
