import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Checkbox, CheckboxProps } from './Checkbox';

interface FilterCheckboxProps extends CheckboxProps {
  description?: string;
  descriptionClassName?: string;
}

export function FilterCheckbox({
  description,
  children,
  descriptionClassName,
  ...props
}: FilterCheckboxProps): ReactElement {
  return (
    <Checkbox {...props} className="!items-start !typo-callout">
      <div className="flex flex-col">
        <span className="mb-2">{children}</span>
        {!!description && (
          <span
            className={classNames(
              'font-normal text-text-secondary',
              descriptionClassName,
            )}
          >
            {description}
          </span>
        )}
      </div>
    </Checkbox>
  );
}
