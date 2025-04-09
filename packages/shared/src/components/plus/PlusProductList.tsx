import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { RadioItem } from '../fields/RadioItem';
import { LogEvent } from '../../lib/log';
import { usePlusSubscription } from '../../hooks';
import type { PlusPricingPreview } from '../../graphql/paddle';
import { PlusPlanExtraLabel } from './PlusPlanExtraLabel';

type PlusProductListProps = {
  productList: PlusPricingPreview[];
  selected?: string;
  onChange?: (value: string) => void;
  backgroundImage?: string;
  className?: string;
};

const PlusProductList = ({
  productList,
  selected,
  onChange,
  className,
}: PlusProductListProps): ReactElement => {
  const { logSubscriptionEvent } = usePlusSubscription();

  return (
    <div
      className={classNames(
        'rounded-10 border border-border-subtlest-tertiary',
        className,
      )}
    >
      {productList.map(({ metadata, priceId, price, currency }) => (
        <RadioItem
          key={priceId}
          name={metadata.title}
          id={`${metadata.title}-${priceId}`}
          value={priceId}
          checked={selected === priceId}
          onChange={() => {
            onChange(priceId);
            logSubscriptionEvent({
              event_name: LogEvent.SelectBillingCycle,
              target_id: metadata.title.toLowerCase(),
            });
          }}
          className={{
            content: classNames(
              'min-h-12 w-full rounded-10 !p-2',
              selected === priceId
                ? '-m-px border border-border-subtlest-primary bg-surface-float'
                : undefined,
            ),
          }}
        >
          <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Primary}
            >
              {metadata.title}
            </Typography>
            {metadata.caption && (
              <PlusPlanExtraLabel
                color={metadata.caption.color}
                label={metadata.caption.copy}
              />
            )}
          </div>
          <div className="ml-auto mr-1 flex items-center gap-1">
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Body}
              color={TypographyColor.Primary}
              bold
            >
              {price.formatted}
            </Typography>
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Body}
              color={TypographyColor.Secondary}
              className="font-normal"
            >
              {currency?.code}
            </Typography>
          </div>
        </RadioItem>
      ))}
    </div>
  );
};

export default PlusProductList;
