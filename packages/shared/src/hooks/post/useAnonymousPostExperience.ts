import { useAuthContext } from '../../contexts/AuthContext';

interface UseAnonymousPostExperience {
  isAnonPostExperience: boolean;
  isPostPageExperience: boolean;
}

export const useAnonymousPostExperience = (): UseAnonymousPostExperience => {
  const { isAuthReady, user } = useAuthContext();

  return {
    isAnonPostExperience: isAuthReady && !user,
    isPostPageExperience: true,
  };
};
