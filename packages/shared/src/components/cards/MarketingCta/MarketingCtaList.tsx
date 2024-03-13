import React, { ReactElement } from 'react';
import { Card } from '../Card';
import { CTAButton, Description, Header, MarketingCta, Title } from './common';

export function MarketingCtaList({
  marketingCta,
}: {
  marketingCta: MarketingCta;
}): ReactElement {
  const { tagColor, tagText, title, description, ctaUrl, ctaText } =
    marketingCta.flags;
  return (
    <Card className="p-4">
      {tagColor && tagText && <Header tagColor={tagColor} tagText={tagText} />}
      <Title>{title}</Title>
      {description && <Description>{description}</Description>}
      {ctaUrl && ctaText && (
        <CTAButton
          className="mt-4 max-w-64"
          ctaUrl={ctaUrl}
          ctaText={ctaText}
        />
      )}
    </Card>
  );
}
