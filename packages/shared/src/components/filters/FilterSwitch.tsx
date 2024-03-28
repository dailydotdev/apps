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
    <div className="my-4 flex flex-col">
      <Switch
        className="h-8"
        defaultTypo={false}
        labelClassName="typo-callout"
        {...props}
      >
        {label}
      </Switch>
      <p className="mt-3 text-text-tertiary typo-callout">{description}</p>
    </div>
  );
}

export default FilterSwitch;
