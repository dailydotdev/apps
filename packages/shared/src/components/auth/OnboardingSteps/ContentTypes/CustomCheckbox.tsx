// TODO: move in a new component in shared if the onboardingContentType experiment is successful
import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { Checkbox } from '../../../fields/Checkbox';

interface CustomCheckboxProps {
  checked: boolean;
  title: string;
  description: string;
  onCheckboxToggle: () => void;
  name: string;
}
export const CustomCheckbox = ({
  checked,
  title,
  description,
  onCheckboxToggle,
  name,
}: CustomCheckboxProps): ReactElement => {
  return (
    <button
      type="button"
      className={classNames(
        'inline-grid h-[8.25rem] max-w-80 cursor-pointer content-start rounded-16 border p-4 text-left',
        checked
          ? 'border-accent-cabbage-bolder bg-surface-float text-text-primary'
          : 'text-text-tertiary',
      )}
      onClick={onCheckboxToggle}
    >
      <div className="flex">
        <p className="mr-auto font-bold typo-title3">{title}</p>
        {checked && (
          <Checkbox
            className="pointer-events-none !p-0"
            checkmarkClassName="!mr-0"
            name={name}
            checked
          />
        )}
      </div>
      <p className="mt-1.5 text-text-tertiary typo-body">{description}</p>
    </button>
  );
};
