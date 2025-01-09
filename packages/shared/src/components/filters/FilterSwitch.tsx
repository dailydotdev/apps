import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { SwitchProps } from '../fields/Switch';
import { Switch } from '../fields/Switch';

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
    <div className="flex flex-col">
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
