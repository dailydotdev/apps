import { useAuthContext } from '../contexts/AuthContext';
import { SMART_TITLE_MONTHLY_FREE_TRIES } from '../graphql/posts';

export function useClickbaitTries() {
  const { user } = useAuthContext();
  const maxTries = SMART_TITLE_MONTHLY_FREE_TRIES;
  const usedTries = user?.clickbaitTries ?? 0;
  const hasUsedFreeTrial = usedTries >= maxTries;
  const triesLeft = maxTries - usedTries;
  return { maxTries, hasUsedFreeTrial, triesLeft };
}

export default useClickbaitTries;
