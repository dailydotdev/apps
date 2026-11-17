import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
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
import { getBuyCoresUrl } from '../../lib/links';
import { useAuthContext } from '../../contexts/AuthContext';
import { coresPricesQueryOptions } from '../../graphql/njord';

export const FeaturedCoresWidget = ({
  className,
  onClick,
  origin,
  amounts,
  next,
}: {
  className?: string;
  onClick: (props: LogStartBuyingCreditsProps) => void;
  origin: Origin;
  amounts: number[];
  /** Where a purchase started here returns to */
  next?: string;
}): ReactElement => {
  const { user, isLoggedIn } = useAuthContext();
  const { data: prices, isPending: isPendingPrices } = useQuery(
    coresPricesQueryOptions({
      user,
      isLoggedIn,
    }),
  );

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
                next={next}
              />
            );
          })}
        {!isPendingPrices &&
          prices?.map((item) => {
            const { coresValue } = item.metadata;

            if (coresValue === undefined || !amounts.includes(coresValue)) {
              return null;
            }

            return (
              <BuyCore
                key={item.priceId}
                onBuyCoresClick={onClick}
                amount={coresValue}
                priceFormatted={item.price.formatted}
                origin={origin}
                next={next}
                pid={item.priceId}
              />
            );
          })}
      </div>
      <Button
        variant={ButtonVariant.Float}
        onClick={() => onClick({ target_id: 'See more options', origin })}
        tag="a"
        href={getBuyCoresUrl({ origin, next })}
      >
        See more options
      </Button>
    </WidgetContainer>
  );
};
