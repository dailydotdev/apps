import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { CheckboxProps } from './Checkbox';
import { Checkbox } from './Checkbox';

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
    <Checkbox {...props} className="!typo-callout !items-start">
      <div className="flex flex-col">
        <span className="mb-2">{children}</span>
        {!!description && (
          <span
            className={classNames(
              'text-text-secondary font-normal',
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
