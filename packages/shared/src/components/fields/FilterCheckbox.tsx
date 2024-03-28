import React, { ReactElement } from 'react';
import { Checkbox, CheckboxProps } from './Checkbox';

interface FilterCheckboxProps extends CheckboxProps {
  description: string;
}

export function FilterCheckbox({
  description,
  children,
  ...props
}: FilterCheckboxProps): ReactElement {
  return (
    <Checkbox {...props} className="!items-start !typo-callout">
      <div className="flex flex-col">
        <span className="mb-2">{children}</span>
        <span className="font-normal text-text-secondary">{description}</span>
      </div>
    </Checkbox>
  );
}
