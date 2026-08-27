import type { ReactElement } from 'react';
import React from 'react';
import type { PostHeroSignificance } from '../../../graphql/types';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureHeroCards } from '../../../lib/featureManagement';
import { SimpleTooltip } from '../../tooltips';
import { isTesting } from '../../../lib/constants';

export const WhyFeaturedButton = ({
  significance,
}: {
  significance: PostHeroSignificance | null | undefined;
}): ReactElement | null => {
  const { value: heroCardsConfig } = useConditionalFeature({
    feature: featureHeroCards,
    shouldEvaluate: !!significance,
  });
  if (!significance || !heroCardsConfig.enabled) {
    return null;
  }
  const label = heroCardsConfig.chipLabels[significance];
  if (!label) {
    return null;
  }
  return (
    <SimpleTooltip
      forceLoad={!isTesting}
      content={`This card is highlighted because we think it's '${label}'. You can disable hero cards in Settings → Appearance.`}
    >
      <button
        type="button"
        aria-label="Why is this card featured?"
        className="absolute right-3 top-3 z-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/24 bg-overlay-secondary-pepper font-bold leading-none text-white backdrop-blur-md typo-callout hover:bg-overlay-primary-pepper"
      >
        ?
      </button>
    </SimpleTooltip>
  );
};
