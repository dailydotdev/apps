import { featureReadingReminderVariation } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

export const ReadingReminderVariation = {
  Control: 'control',
  Hero: 'hero',
  Inline: 'inline',
} as const;

export type ReadingReminderVariationType =
  (typeof ReadingReminderVariation)[keyof typeof ReadingReminderVariation];

const validVariations = new Set<ReadingReminderVariationType>(
  Object.values(ReadingReminderVariation),
);

export const getReadingReminderVariation = (
  value: unknown,
): ReadingReminderVariationType => {
  return validVariations.has(value as ReadingReminderVariationType)
    ? (value as ReadingReminderVariationType)
    : ReadingReminderVariation.Control;
};

interface UseReadingReminderVariationProps {
  shouldEvaluate?: boolean;
}

interface UseReadingReminderVariation {
  variation: ReadingReminderVariationType;
  isControl: boolean;
  isHero: boolean;
  isInline: boolean;
}

export const useReadingReminderVariation = ({
  shouldEvaluate = true,
}: UseReadingReminderVariationProps = {}): UseReadingReminderVariation => {
  const { value } = useConditionalFeature({
    feature: featureReadingReminderVariation,
    shouldEvaluate,
  });
  const variation = getReadingReminderVariation(value);

  return {
    variation,
    isControl: variation === ReadingReminderVariation.Control,
    isHero: variation === ReadingReminderVariation.Hero,
    isInline: variation === ReadingReminderVariation.Inline,
  };
};
