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
      {plans.map((plan) =>
        (() => {
          const planValue = plan.value;

          if (!planValue) {
            throw new Error(
              'PricingPlans requires each plan to define a value',
            );
          }

          return (
            <PricingPlan
              {...plan}
              key={planValue}
              name={name}
              id={`${name}-${plan.id || planValue}`}
              value={planValue}
              checked={value === planValue}
              onChange={() => onChange(planValue)}
              perks={perks}
            />
          );
        })(),
      )}
    </div>
  );
}
