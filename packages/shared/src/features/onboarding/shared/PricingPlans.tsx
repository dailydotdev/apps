import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { PricingPlan } from './PricingPlan';
import type { PricingPlanProps } from './PricingPlan';

export interface PricingPlansProps<T extends string = string> {
  name: string;
  value?: T;
  onChange: (value: T) => unknown;
  perks?: PricingPlanProps<T>['perks'];
  plans: Omit<PricingPlanProps<T>, 'perks' | 'name' | 'onChange'>[];
  className?: string;
}

export function PricingPlans<T extends string = string>({
  name,
  value,
  plans,
  perks,
  onChange,
  className,
}: PricingPlansProps<T>): ReactElement {
  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      {plans.map((plan) => (
        <PricingPlan
          {...plan}
          key={plan.value}
          name={name}
          id={`${name}-${plan.id || plan.value}`}
          value={plan.value}
          checked={value === plan.value}
          onChange={() => onChange(plan.value)}
          perks={perks}
        />
      ))}
    </div>
  );
}
