import React, { ReactElement, useState } from 'react';
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
  isFormReadonly,
}: LinksFormProps): ReactElement {
  const [validInputs, setValidInputs] = useState({});

  const onChange = (i: number, isValid: boolean) => {
    if (validInputs[i] === isValid) {
      return;
    }

    setValidInputs((state) => ({ ...state, [i]: isValid }));
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
          hint={validInputs[i] === false && 'Must be a valid HTTP/S link'}
          readOnly={isFormReadonly}
          validityChanged={(isValid) => onChange(i, isValid)}
          placeholder="http://example.com"
        />
      ))}
    </div>
  );
}
