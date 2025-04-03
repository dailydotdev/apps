import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { Button, ButtonVariant } from '../buttons/Button';
import { webappUrl } from '../../lib/constants';
import { PlusInfo } from './PlusInfo';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, Origin, TargetType } from '../../lib/log';
import { MarketingCtaVariant } from '../marketingCta/common';
import { useBoot } from '../../hooks';
import PlusListModalSection from './PlusListModalSection';
import { useFeature } from '../GrowthBookProvider';
import { plusTakeoverContent } from '../../lib/featureManagement';
import { PaddleSubProvider } from '../../contexts/payment/Paddle';
import { usePaymentContext } from '../../contexts/payment/context';

const PlusExtensionComponent = (): ReactElement => {
  const { getMarketingCta } = useBoot();
  const marketingCta = getMarketingCta(MarketingCtaVariant.Plus);
  const { flags } = marketingCta || {};
  const { logEvent } = useLogContext();
  const { productOptions } = usePaymentContext();

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

  const experiment = useFeature(plusTakeoverContent);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-row pl-6">
      <div className="flex flex-1 flex-col pr-10 pt-6">
        <PlusInfo
          productOptions={productOptions || []}
          title={experiment?.title ?? flags?.title}
          description={experiment?.description ?? flags?.description}
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
          {experiment?.cta ?? flags?.ctaText}
        </Button>
      </div>
      <PlusListModalSection
        items={experiment?.features}
        shouldShowRefund={experiment?.shouldShowRefund}
        shouldShowReviews={experiment?.shouldShowReviews}
      />
    </div>
  );
};

const PlusExtension = (): ReactElement => {
  return (
    <PaddleSubProvider>
      <PlusExtensionComponent />
    </PaddleSubProvider>
  );
};

export default PlusExtension;
