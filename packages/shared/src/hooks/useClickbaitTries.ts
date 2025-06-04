import { useAuthContext } from '../contexts/AuthContext';
import { useFeature } from '../components/GrowthBookProvider';
import { clickbaitTriesMax } from '../lib/featureManagement';

export function useClickbaitTries() {
  const { user } = useAuthContext();
  const maxTries = useFeature(clickbaitTriesMax);
  const usedTries = user?.clickbaitTries ?? 0;
  const hasUsedFreeTrial = usedTries >= maxTries;
  const triesLeft = maxTries - usedTries;
  return { maxTries, hasUsedFreeTrial, triesLeft };
}

export default useClickbaitTries;
