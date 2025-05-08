import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { webappUrl } from '../../lib/constants';
import { Button } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../typography/Typography';
import { WidgetContainer } from '../widgets/common';
import { BuyCore } from './BuyCore';
import type { LogStartBuyingCreditsProps } from '../../types';
import type { Origin } from '../../lib/log';
import { getPathnameWithQuery } from '../../lib';
import { useProductPricing } from '../../hooks/useProductPricing';
import { ProductPricingType } from '../../graphql/paddle';

export const FeaturedCoresWidget = ({
  className,
  onClick,
  origin,
  amounts,
}: {
  className?: string;
  onClick: (props: LogStartBuyingCreditsProps) => void;
  origin: Origin;
  amounts: number[];
}): ReactElement => {
  const { data: prices, isPending: isPendingPrices } = useProductPricing({
    type: ProductPricingType.Cores,
  });

  return (
    <WidgetContainer
      className={classNames('flex flex-col gap-4 p-6', className)}
    >
      <div className="gap-1">
        <Typography type={TypographyType.Body} bold>
          Buy Cores
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Secondary}
        >
          Stock up on Cores to engage, reward, and unlock more on daily.dev
        </Typography>
      </div>
      <div className="flex gap-3">
        {isPendingPrices &&
          amounts.map((itemAmount, index) => {
            return (
              <BuyCore
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                onBuyCoresClick={onClick}
                amount={itemAmount}
                origin={origin}
              />
            );
          })}
        {!isPendingPrices &&
          prices
            ?.filter((item) => amounts.includes(item.metadata.coresValue))
            .map((item) => {
              return (
                <BuyCore
                  key={item.priceId}
                  onBuyCoresClick={onClick}
                  amount={item.metadata.coresValue}
                  priceFormatted={item.price.formatted}
                  origin={origin}
                  pid={item.priceId}
                />
              );
            })}
      </div>
      <Button
        variant={ButtonVariant.Float}
        onClick={() => onClick({ target_id: 'See more options', origin })}
        tag="a"
        href={getPathnameWithQuery(
          `${webappUrl}cores`,
          new URLSearchParams({
            origin,
          }),
        )}
      >
        See more options
      </Button>
    </WidgetContainer>
  );
};
