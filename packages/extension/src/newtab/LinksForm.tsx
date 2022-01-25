import React, { ReactElement, useEffect, useState } from 'react';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';

const limit = 8;
const list = Array(limit).fill(0);

interface LinksFormProps {
  links: string[];
  isFormReadonly?: boolean;
  errors?: Record<string | number, string>;
}

export function LinksForm({
  links,
  errors,
  isFormReadonly,
}: LinksFormProps): ReactElement {
  const [staleInput, setStaleInput] = useState({});

  useEffect(() => {
    const unchanged = {};
    Object.keys(errors).forEach((key) => {
      unchanged[key] = true;
    });
    setStaleInput(unchanged);
  }, [errors]);

  const onChange = (i: number) => {
    if (!staleInput[i]) {
      return;
    }

    setStaleInput((state) => ({ ...state, [i]: false }));
  };

  return (
    <div className="flex flex-col gap-4">
      {list.map((_, i) => (
        <TextField
          name="shortcutLink"
          inputId={`shortcutLink-${i}`}
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          fieldType="tertiary"
          label="Add shortcuts"
          value={links[i]}
          valid={!staleInput[i]}
          hint={staleInput[i] && 'Must be a valid HTTP/S link'}
          readOnly={isFormReadonly}
          onChange={() => onChange(i)}
          placeholder="http://example.com"
        />
      ))}
    </div>
  );
}
