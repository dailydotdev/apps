import React, { ReactElement } from 'react';
import { Switch, SwitchProps } from '../fields/Switch';

interface FilterSwitchProps extends SwitchProps {
  id: number | string;
  title: string;
  description: string;
  onToggleFilter: (id: number | string) => unknown;
}

export function FilterSwitch({
  id,
  title,
  description,
  onToggleFilter,
  ...props
}: FilterSwitchProps): ReactElement {
  return (
    <div className="flex flex-col my-4">
      <Switch
        className="h-8"
        defaultTypo={false}
        labelClassName="typo-callout"
        onToggle={() => onToggleFilter(id)}
        {...props}
      >
        {title}
      </Switch>
      <p className="mt-3 typo-callout text-theme-label-tertiary">
        {description}
      </p>
    </div>
  );
}

export default FilterSwitch;
