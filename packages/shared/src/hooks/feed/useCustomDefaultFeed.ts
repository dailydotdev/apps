import { useAuthContext } from '../../contexts/AuthContext';

type UseCustomDefaultFeed = {
  isCustomDefaultFeed: boolean;
  defaultFeedId: string;
};

const useCustomDefaultFeed = (): UseCustomDefaultFeed => {
  const { user } = useAuthContext();

  return {
    isCustomDefaultFeed: user?.defaultFeedId && user.defaultFeedId !== user?.id,
    defaultFeedId: user?.defaultFeedId ?? user?.id,
  };
};

export default useCustomDefaultFeed;
