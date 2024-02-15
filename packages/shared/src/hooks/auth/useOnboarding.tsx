import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';
import { PostPageOnboarding } from '../../lib/featureValues';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseOnboarding {
  shouldShowBottomBanner: boolean;
}

export const useOnboarding = (): UseOnboarding => {
  const { isAuthReady, user } = useAuthContext();
  const postPageOnboarding = useFeature(feature.postPageOnboarding);
  const shouldShowBottomBanner =
    postPageOnboarding === PostPageOnboarding.V1 && isAuthReady && !user;

  return { shouldShowBottomBanner };
};
