import React, { ReactElement, ReactNode } from 'react';
import { Switch, SwitchProps } from '../fields/Switch';

interface FilterSwitchProps extends SwitchProps {
  label: ReactNode;
  description: ReactNode;
}

export function FilterSwitch({
  label,
  description,
  ...props
}: FilterSwitchProps): ReactElement {
  return (
    <div className="flex flex-col my-4">
      <Switch
        className="h-8"
        defaultTypo={false}
        labelClassName="typo-callout"
        {...props}
      >
        {label}
      </Switch>
      <p className="mt-3 typo-callout text-theme-label-tertiary">
        {description}
      </p>
    </div>
  );
}

export default FilterSwitch;
