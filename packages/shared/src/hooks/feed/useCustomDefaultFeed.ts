import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import {
  DailyPageVariant,
  featureDailyPage,
} from '../../lib/featureManagement';

type UseCustomDefaultFeed = {
  isCustomDefaultFeed: boolean;
  defaultFeedId: string;
};

const useCustomDefaultFeed = (): UseCustomDefaultFeed => {
  const { user, isLoggedIn } = useAuthContext();
  const { value: dailyVariant } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isLoggedIn,
  });

  // Daily owns the default home in this variant, so any saved custom default
  // feed is ignored regardless of what boot returns.
  if (dailyVariant === DailyPageVariant.DailyAsDefault) {
    return {
      isCustomDefaultFeed: false,
      defaultFeedId: user?.id ?? '',
    };
  }

  return {
    isCustomDefaultFeed: !!(
      user?.defaultFeedId && user.defaultFeedId !== user?.id
    ),
    defaultFeedId: user?.defaultFeedId ?? user?.id ?? '',
  };
};

export default useCustomDefaultFeed;
