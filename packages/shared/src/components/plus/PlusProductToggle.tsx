import React from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { usePaymentContext } from '../../contexts/payment/context';
import type { ProductPricingType } from '../../graphql/paddle';
import type { WithClassNameProps } from '../utilities';
import { usePlusSubscription } from '../../hooks';
import { LogEvent } from '../../lib/log';

export type ProductToggleOptions = {
  priceType: ProductPricingType;
  label: string;
  className?: string;
};

type Props = {
  options: ProductToggleOptions[];
  onSelect?: (option: ProductToggleOptions) => void;
} & WithClassNameProps;

export const PlusProductToggle = ({
  className,
  options = [],
  onSelect,
}: Props): ReactElement => {
  const { priceType, setPriceType } = usePaymentContext();
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <ButtonGroup className={className}>
      {options.map((option) => {
        const isSelected = priceType === option.priceType;
        return (
          <Button
            key={`plus-product-toggle-${option.priceType}`}
            variant={isSelected ? ButtonVariant.Float : ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={() => {
              setPriceType(option.priceType);
              onSelect?.(option);
              logSubscriptionEvent({
                event_name: LogEvent.SelectSubscriptionType,
                target_id: option.label.toLowerCase(),
              });
            }}
            className={classNames(option.className, {
              'text-text-primary': isSelected,
            })}
          >
            {option.label}
          </Button>
        );
      })}
    </ButtonGroup>
  );
};
