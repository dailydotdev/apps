import React, { ReactElement } from 'react';
import { Card } from '../Card';
import { CardCover } from '../common/CardCover';
import { CTAButton, Description, Header, MarketingCTA, Title } from './common';
import { Card as CardV1 } from '../v1/Card';
import { useFeedLayout } from '../../../hooks';

export function MarketingCTACard({
  marketingCTA,
}: {
  marketingCTA: MarketingCTA;
}): ReactElement {
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const CardComponent = shouldUseMobileFeedLayout ? CardV1 : Card;

  return (
    <CardComponent className="p-4">
      {marketingCTA.tagColor && marketingCTA.tagText && (
        <Header
          tagColor={marketingCTA.tagColor}
          tagText={marketingCTA.tagText}
        />
      )}
      <Title>{marketingCTA.title}</Title>
      {marketingCTA.description && (
        <Description>{marketingCTA.description}</Description>
      )}
      {marketingCTA.image && (
        <CardCover
          imageProps={{
            loading: 'lazy',
            alt: 'Post Cover image',
            src: marketingCTA.image,
            className: 'w-full my-3',
          }}
        />
      )}
      {marketingCTA.ctaUrl && marketingCTA.ctaText && (
        <CTAButton
          ctaUrl={marketingCTA.ctaUrl}
          ctaText={marketingCTA.ctaText}
        />
      )}
    </CardComponent>
  );
}
