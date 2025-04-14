import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import type { RadioItemProps } from '../../../components/fields/RadioItem';
import { RadioItem } from '../../../components/fields/RadioItem';
import { VIcon } from '../../../components/icons/V';
import { IconSize } from '../../../components/Icon';
import styles from './PricingPlan.module.css';
import { FunnelTargetId } from '../types/funnelEvents';

export enum PricingPlanVariation {
  DEFAULT = 'default',
  BEST_VALUE = 'best_value',
}

export interface PricingPlanProps<T extends string = string>
  extends Omit<RadioItemProps<T>, 'label' | 'className'> {
  label: string;
  variation?: PricingPlanVariation;
  badge?: {
    text: string;
    background: string;
  };
  perks?: string[];
  price: {
    amount: string;
    subtitle: string;
  };
}

export function PricingPlan<T extends string = string>({
  label,
  variation,
  badge,
  perks,
  price,
  checked,
  ...props
}: PricingPlanProps<T>): ReactElement {
  const isBestValue = variation === PricingPlanVariation.BEST_VALUE;
  const baseClassName: RadioItemProps<T>['className'] = {
    wrapper:
      isBestValue &&
      `relative p-1 pt-8 rounded-16 overflow-hidden ${styles.bestValue}`,
    content: classNames(
      styles.label,
      'z-1 !items-start gap-2 overflow-hidden rounded-12 border p-3',
      isBestValue && 'border-0',
      checked
        ? 'border-brand-default bg-brand-float'
        : 'border-border-subtlest-secondary bg-background-default',
    ),
  };

  return (
    <RadioItem
      {...props}
      className={baseClassName}
      checked={checked}
      data-funnel-track={FunnelTargetId.SubPlan}
    >
      <div className="flex flex-1 flex-col gap-2 font-normal">
        <div className="flex flex-row">
          <div className="flex flex-1 flex-col items-start gap-2">
            <div className="font-bold text-text-primary typo-title3">
              {label}
            </div>
            {badge && (
              <div
                className="invert flex rounded-6 bg-surface-secondary px-2 py-0.5 font-bold text-text-primary typo-caption1"
                style={{ background: checked ? badge.background : '' }}
              >
                {badge.text}
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col items-end">
            <div className="font-bold text-text-primary typo-title1">
              {price.amount}
            </div>
            <div className="text-text-tertiary typo-footnote">
              {price.subtitle}
            </div>
          </div>
        </div>
        {checked && perks && (
          <ul className="flex flex-col gap-0.5 text-text-tertiary">
            {perks.map((item) => (
              <li key={item} className="flex flex-row items-center gap-1">
                <VIcon size={IconSize.Size16} />
                <span className="typo-footnote">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </RadioItem>
  );
}
