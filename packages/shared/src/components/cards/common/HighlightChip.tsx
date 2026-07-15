import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { PostHeroSignificance } from '../../../graphql/types';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureHeroCards } from '../../../lib/featureManagement';

export const HighlightChip = ({
  significance,
  className,
}: {
  significance: PostHeroSignificance | null | undefined;
  className?: string;
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
    <span
      className={classNames(
        'pointer-events-none relative inline-flex w-fit',
        className,
      )}
    >
      <span
        aria-hidden
        className="breaking-news-chip-glow absolute -inset-0.5 rounded-8 opacity-40 blur-[2px] motion-reduce:animate-none"
      />
      <span className="breaking-news-chip-fill relative block overflow-hidden rounded-8 px-2 py-0.5 font-bold text-white shadow-[0_0_6px_color-mix(in_srgb,var(--theme-accent-ketchup-default)_30%,transparent)] typo-caption2">
        {label}
      </span>
    </span>
  );
};
