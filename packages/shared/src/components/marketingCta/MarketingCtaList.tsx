import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import { ListCard } from '../cards/common/list/ListCard';
import { useBoot } from '../../hooks';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import type { MarketingCta } from './common';
import { CTAButton, Description, Header, Title } from './common';
import { CardCoverList } from '../cards/common/list/CardCover';

export function MarketingCtaList({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    marketingCta.flags;
  const { clearMarketingCta } = useBoot();
  const { logEvent } = useLogContext();
  const isImpressionLogged = useRef(false);

  useEffect(() => {
    if (isImpressionLogged.current) {
      return;
    }

    logEvent({
      event_name: LogEvent.Impression,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    isImpressionLogged.current = true;
  }, [marketingCta.campaignId, logEvent]);

  const onCtaClick = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, logEvent]);

  const onCtaDismiss = useCallback(() => {
    logEvent({
      event_name: LogEvent.MarketingCtaDismiss,
      target_type: TargetType.PromotionCard,
      target_id: marketingCta.campaignId,
    });
    clearMarketingCta(marketingCta.campaignId);
  }, [clearMarketingCta, marketingCta.campaignId, logEvent]);

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
