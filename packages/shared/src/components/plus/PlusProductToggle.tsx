import React, { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../buttons/Button';
import { usePaymentContext } from '../../contexts/payment/context';
import type { PurchaseType } from '../../graphql/paddle';
import type { WithClassNameProps } from '../utilities';
import { usePlusSubscription } from '../../hooks';
import { LogEvent } from '../../lib/log';
import { plusUrl } from '../../lib/constants';

export type ProductToggleOptions = {
  priceType: PurchaseType;
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
  const { query, replace } = useRouter();
  const { logSubscriptionEvent } = usePlusSubscription();
  const initialLoaded = useRef(false);

  useEffect(() => {
    if (query?.type && !initialLoaded.current) {
      initialLoaded.current = true;
      const selectedOption = options.find(
        (option) => option.label.toLowerCase() === query.type,
      );
      if (selectedOption) {
        setPriceType?.(selectedOption.priceType);
      }
    }
  }, [options, query.type, setPriceType]);

  return (
    <ButtonGroup className={className}>
      {options.map((option) => {
        const isSelected = priceType === option.priceType;
        return (
          <Button
            key={`plus-product-toggle-${option.priceType}`}
            variant={isSelected ? ButtonVariant.Float : ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            onClick={async () => {
              setPriceType?.(option.priceType);
              onSelect?.(option);
              await replace({
                pathname: plusUrl,
                query: {
                  ...query,
                  type: option.label.toLowerCase(),
                },
              });
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
