import { OnboardingContextData } from '../contexts/OnboardingContext';
import { LoggedUser } from '../lib/user';
import usePersistentState from './usePersistentState';

export default function useOnboarding(
  user?: LoggedUser,
  loadedUserFromCache?: boolean,
): OnboardingContextData {
  const [showWelcome, setShowWelcome, loadedFromCache] = usePersistentState(
    'showWelcome',
    null,
    true,
  );
  return {
    showWelcome: showWelcome && !user,
    setShowWelcome,
    onboardingReady: loadedFromCache && loadedUserFromCache,
  };
}
