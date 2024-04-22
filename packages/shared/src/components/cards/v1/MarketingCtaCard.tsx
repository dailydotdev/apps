import React, { ReactElement, useCallback, useEffect, useRef } from 'react';
import { CardCover } from '../common/CardCover';

import { Card as CardV1 } from './Card';
import { useBoot } from '../../../hooks';
import { useAnalyticsContext } from '../../../contexts/AnalyticsContext';
import { AnalyticsEvent, TargetType } from '../../../lib/analytics';
import {
  CTAButton,
  Description,
  Header,
  MarketingCta,
  Title,
} from '../MarketingCta/common';
import { CardCoverV1 } from './CardCover';

export function MarketingCtaCardV1({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    marketingCta.flags;
  const { clearMarketingCta } = useBoot();
  const { trackEvent } = useAnalyticsContext();
  const isImpressionTracked = useRef(false);

  useEffect(() => {
    if (isImpressionTracked.current) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.MarketingCtaCard,
      target_id: marketingCta.campaignId,
    });
    isImpressionTracked.current = true;
  }, [marketingCta.campaignId, trackEvent]);

  const onCtaClick = useCallback(() => {
    trackEvent({
      event_name: AnalyticsEvent.Click,
      target_type: TargetType.MarketingCtaCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, trackEvent]);

  const onCtaDismiss = useCallback(() => {
    trackEvent({
      event_name: AnalyticsEvent.MarketingCtaDismiss,
      target_type: TargetType.MarketingCtaCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, trackEvent]);

  return (
    <CardV1 className="p-4">
      {tagColor && tagText && (
        <Header tagColor={tagColor} tagText={tagText} onClose={onCtaDismiss} />
      )}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {image && (
        <CardCoverV1
          imageProps={{
            loading: 'lazy',
            alt: 'Post Cover',
            src: image,
            className: 'w-full my-3',
          }}
        />
      )}
      {ctaUrl && ctaText && (
        <CTAButton onClick={onCtaClick} ctaUrl={ctaUrl} ctaText={ctaText} />
      )}
    </CardV1>
  );
}
