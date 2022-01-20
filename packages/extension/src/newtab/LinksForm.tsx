import React, { MutableRefObject, ReactElement } from 'react';
import { TextField } from '@dailydotdev/shared/src/components/fields/TextField';

const limit = 8;
const list = Array(limit).fill(0);

interface LinksFormProps {
  links: string[];
  isFormDisabled?: boolean;
  formRef: MutableRefObject<HTMLFormElement>;
}

export function LinksForm({
  links,
  formRef,
  isFormDisabled,
}: LinksFormProps): ReactElement {
  return (
    <form className="flex flex-col gap-4 w-full" ref={formRef}>
      {list.map((_, i) => (
        <TextField
          inputId={`shortcutLink-${i}`}
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          label=""
          value={links[i]}
          disabled={isFormDisabled}
        />
      ))}
    </form>
  );
}
