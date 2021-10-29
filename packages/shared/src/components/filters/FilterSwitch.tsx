import React, { ReactElement } from 'react';
import { Switch, SwitchProps } from '../fields/Switch';

interface FilterSwitchProps extends SwitchProps {
  title: string;
  description: string;
}

export function FilterSwitch({
  title,
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
        {title}
      </Switch>
      <p className="mt-3 typo-callout text-theme-label-tertiary">
        {description}
      </p>
    </div>
  );
}

export default FilterSwitch;
