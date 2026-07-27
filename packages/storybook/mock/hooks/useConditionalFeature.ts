import { useFeatureOverride } from '../GrowthBookProvider';

type FeatureLike = { id: string; defaultValue: unknown };

/**
 * Mirrors the real hook, minus GrowthBook: a story-pinned value when one is
 * provided (see `FeatureOverrides`), otherwise the flag's own default — which
 * is what the unmocked hook resolves to without a GrowthBook instance.
 */
export const useConditionalFeature = ({
  feature,
}: {
  feature: FeatureLike;
  shouldEvaluate?: boolean;
}): { value: unknown; isLoading: boolean } => {
  const override = useFeatureOverride(feature);

  return {
    value: override === undefined ? feature?.defaultValue : override,
    isLoading: false,
  };
};
