import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../../lib/config';
import { PlusUser } from '../PlusUser';
import { TypographyType } from '../typography/Typography';
import { IconSize } from '../Icon';
import { PlusList } from './PlusList';
import { plusRedBackgroundImage } from '../../lib/image';
import { Image } from '../image/Image';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { PlusInfo } from './PlusInfo';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useBoot } from '../../hooks';

const PlusExtension = (): ReactElement => {
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta;
  const { ctaText } = flags;
  const { logEvent } = useLogContext();
  const { data: productOptions } = useQuery({
    queryKey: generateQueryKey(RequestKey.PricePreview),
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/price_previews`);
      const json = await response.json();
      return json?.details?.lineItems.map((item) => ({
        label: item.price.description,
        value: item.price.id,
        price: item.formattedTotals.total,
        priceUnformatted: Number(item.totals.total),
        currencyCode: json?.currencyCode as string,
        extraLabel: item.price.customData?.label as string,
      }));
    },
  });

  const handleClick = () => {
    logEvent({
      event_name: LogEvent.UpgradeSubscription,
      target_type: TargetType.MarketingCtaPlus,
      target_id: marketingCta.campaignId,
      extra: JSON.stringify({
        origin: Origin.InAppPromotion,
      }),
    });
  };

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-row pl-6">
        <div className="flex w-[28.5rem] flex-col pb-32 pr-10 pt-6">
          {productOptions && productOptions.length > 0 && (
            <PlusInfo
              productOptions={productOptions}
              selectedOption={selectedOption}
              onChange={setSelectedOption}
              showPlusList={false}
              showDailyDevLogo
            />
          )}
          <Button
            variant={ButtonVariant.Primary}
            tag="a"
            href={`${webappUrl}plus/payment?pid=${selectedOption}`}
            disabled={!selectedOption}
            className="mt-8"
            onClick={handleClick}
          >
            {ctaText}
          </Button>
        </div>
        <div className="relative flex w-[28.5rem] flex-col gap-8 bg-black pr-6">
          <PlusUser
            iconSize={IconSize.Large}
            typographyType={TypographyType.Title1}
            className="opacity-0"
          />
          <Image className="absolute bottom-0" src={plusRedBackgroundImage} />
          <PlusList className="z-1 pl-10" />
        </div>
      </div>
    </div>
  );
};

export default PlusExtension;
