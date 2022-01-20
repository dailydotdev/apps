import React, { ReactElement } from 'react';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';

const limit = 8;
const list = Array(limit).fill(0);

interface LinksFormProps {
  links: string[];
  isFormDisabled?: boolean;
}

export function LinksForm({
  links,
  isFormDisabled,
}: LinksFormProps): ReactElement {
  return (
    <div className="flex flex-col gap-4">
      {list.map((_, i) => (
        <TextField
          name="shortcutLink"
          inputId={`shortcutLink-${i}`}
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          label=""
          value={links[i]}
          disabled={isFormDisabled}
        />
      ))}
    </div>
  );
}
