import React, { ReactElement } from 'react';
import { Card } from '../Card';
import { CTAButton, Description, Header, MarketingCTA, Title } from './common';

export function MarketingCTAList({
  marketingCTA,
}: {
  marketingCTA: MarketingCTA;
}): ReactElement {
  return (
    <Card className="p-4">
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
      {marketingCTA.ctaUrl && marketingCTA.ctaText && (
        <CTAButton
          className="mt-4 max-w-64"
          ctaUrl={marketingCTA.ctaUrl}
          ctaText={marketingCTA.ctaText}
        />
      )}
    </Card>
  );
}
