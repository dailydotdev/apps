import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import {
  DailyPageVariant,
  featureDailyPage,
} from '../../lib/featureManagement';

interface UseDailyPage {
  isEnabled: boolean;
  isDailyDefault: boolean;
  isDailyAsDefault: boolean;
  setShowDaily: (value: boolean) => void;
  isLoading: boolean;
}

export const useDailyPage = (): UseDailyPage => {
  const { isLoggedIn, daily, setDaily } = useAuthContext();
  const { value: dailyVariant, isLoading } = useConditionalFeature({
    feature: featureDailyPage,
    shouldEvaluate: isLoggedIn,
  });
  const isDailyDefault = dailyVariant === DailyPageVariant.DailyAsDefault;

  return {
    isEnabled: !!dailyVariant && dailyVariant !== DailyPageVariant.None,
    isDailyDefault,
    isDailyAsDefault: isDailyDefault && !!daily,
    setShowDaily: setDaily ?? (() => undefined),
    isLoading,
  };
};
