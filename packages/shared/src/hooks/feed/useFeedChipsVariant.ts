import { useAuthContext } from '../../contexts/AuthContext';
import { TagChipSeedStrategy } from '../../graphql/feed';
import {
  FeedChipsVariant,
  featureFeedChips,
} from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';

export type UseFeedChipsVariant = {
  variant: string;
  hasTagChipFeeds: boolean;
  tagChipSeedStrategy: TagChipSeedStrategy;
};

export const useFeedChipsVariant = (): UseFeedChipsVariant => {
  const { user } = useAuthContext();

  const { value: variant } = useConditionalFeature({
    feature: featureFeedChips,
    shouldEvaluate: !!user,
  });

  return {
    variant,
    hasTagChipFeeds:
      variant === FeedChipsVariant.V2 || variant === FeedChipsVariant.V3,
    tagChipSeedStrategy:
      variant === FeedChipsVariant.V3
        ? TagChipSeedStrategy.V3
        : TagChipSeedStrategy.V2,
  };
};
