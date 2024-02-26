import { useAuthContext } from '../../contexts/AuthContext';

interface UseOnboarding {
  shouldShowAuthBanner: boolean;
}

export const useOnboarding = (): UseOnboarding => {
  const { isAuthReady, user } = useAuthContext();
  const shouldShowAuthBanner = isAuthReady && !user;

  return { shouldShowAuthBanner };
};
