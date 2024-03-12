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
  const { tagColor, tagText, title, description, image, ctaUrl, ctaText } =
    marketingCTA;
  const { shouldUseMobileFeedLayout } = useFeedLayout();
  const CardComponent = shouldUseMobileFeedLayout ? CardV1 : Card;

  return (
    <CardComponent className="p-4">
      {tagColor && tagText && <Header tagColor={tagColor} tagText={tagText} />}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {image && (
        <CardCover
          imageProps={{
            loading: 'lazy',
            alt: 'Post Cover',
            src: image,
            className: 'w-full my-3',
          }}
        />
      )}
      {ctaUrl && ctaText && <CTAButton ctaUrl={ctaUrl} ctaText={ctaText} />}
    </CardComponent>
  );
}
