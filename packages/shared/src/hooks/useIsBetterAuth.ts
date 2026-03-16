import { useFeature } from '../components/GrowthBookProvider';
import { featureAuthStrategy } from '../lib/featureManagement';

export const useIsBetterAuth = (): boolean => {
  const authStrategy = useFeature(featureAuthStrategy);
  return authStrategy === 'betterauth';
};
