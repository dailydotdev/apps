import React, { ReactElement, useCallback, useEffect, useRef } from 'react';
import { ListCard } from './ListCard';
import { useBoot } from '../../../hooks';
import { useLogContext } from '../../../contexts/LogContext';
import { LogsEvent, TargetType } from '../../../lib/logs';
import {
  CTAButton,
  Description,
  Header,
  MarketingCta,
  Title,
} from '../MarketingCta/common';
import { CardCoverList } from './CardCover';

export function MarketingCtaList({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    marketingCta.flags;
  const { clearMarketingCta } = useBoot();
  const { trackEvent } = useLogContext();
  const isImpressionTracked = useRef(false);

  useEffect(() => {
    if (isImpressionTracked.current) {
      return;
    }

    trackEvent({
      event_name: LogsEvent.Impression,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    isImpressionTracked.current = true;
  }, [marketingCta.campaignId, trackEvent]);

  const onCtaClick = useCallback(() => {
    trackEvent({
      event_name: LogsEvent.Click,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, trackEvent]);

  const onCtaDismiss = useCallback(() => {
    trackEvent({
      event_name: LogsEvent.MarketingCtaDismiss,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, trackEvent]);

  return (
    <ListCard className="p-4">
      {tagColor && tagText && (
        <Header tagColor={tagColor} tagText={tagText} onClose={onCtaDismiss} />
      )}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {image && (
        <CardCoverList
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
    </ListCard>
  );
}
