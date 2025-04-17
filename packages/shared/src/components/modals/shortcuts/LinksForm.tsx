import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { TextField } from '../../fields/TextField';
import { useShortcutLinks } from '../../../features/shortcuts/hooks/useShortcutLinks';

const limit = 8;
const list = Array(limit).fill(0);

export function LinksForm(): ReactElement {
  const { formLinks = [], isManual } = useShortcutLinks();
  const [validInputs, setValidInputs] = useState({});
  const isFormReadonly = isManual === false;

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
          value={formLinks[i]}
          valid={validInputs[i] !== false}
          hint={validInputs[i] === false && 'Must be a valid HTTP/S link'}
          readOnly={isFormReadonly}
          validityChanged={(isValid) => onChange(i, isValid)}
          placeholder="http://example.com"
          className={{
            input: isFormReadonly ? '!text-text-quaternary' : undefined,
          }}
        />
      ))}
    </div>
  );
}
