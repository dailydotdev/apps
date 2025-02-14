import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusUser } from '../PlusUser';
import type { TypographyColor } from '../typography/Typography';
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
import { getPricePreviews } from '../../graphql/paddle';
import { PlusPriceTypeAppsId } from '../../lib/featureValues';

const PlusExtension = (): ReactElement => {
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta;
  const { logEvent } = useLogContext();
  const { data: productOptions } = useQuery({
    queryKey: generateQueryKey(RequestKey.PricePreview),
    queryFn: async () => {
      const previews = await getPricePreviews();
      return previews.filter(
        (item) => item.appsId !== PlusPriceTypeAppsId.GiftOneYear,
      );
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
    <div className="flex flex-row pl-6">
      <div className="flex w-[28.5rem] flex-col pb-32 pr-10 pt-6">
        <PlusInfo
          productOptions={productOptions || []}
          title={flags.title}
          description={flags.description}
          selectedOption={selectedOption}
          onChange={({ priceId }) => {
            setSelectedOption(priceId);
          }}
          showPlusList={false}
          showDailyDevLogo
          showGiftButton={false}
        />
        <Button
          variant={ButtonVariant.Primary}
          tag="a"
          href={`${webappUrl}plus/payment?pid=${selectedOption}`}
          disabled={!selectedOption}
          className="mt-8"
          onClick={handleClick}
        >
          {flags.ctaText}
        </Button>
      </div>
      <div className="relative flex w-[28.5rem] flex-col gap-8 bg-black pr-6">
        <PlusUser
          iconSize={IconSize.Large}
          typographyType={TypographyType.Title1}
          className="invisible"
          aria-hidden
        />
        <Image
          className="absolute bottom-0"
          src={flags?.image || plusRedBackgroundImage}
        />
        <PlusList
          typographyProps={{
            color: 'text-white' as TypographyColor,
          }}
          iconProps={{
            className: 'text-white',
          }}
          className="z-1 pl-10"
        />
      </div>
    </div>
  );
};

export default PlusExtension;
