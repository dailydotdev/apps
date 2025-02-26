import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import PlusListModalSection from './PlusListModalSection';

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
    <div className="flex flex-1 flex-row pl-6">
      <div className="flex flex-1 flex-col pr-10 pt-6">
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
          showTrustReviews={false}
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
      <PlusListModalSection />
    </div>
  );
};

export default PlusExtension;
