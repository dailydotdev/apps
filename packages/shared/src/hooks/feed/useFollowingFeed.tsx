import { useMemo } from 'react';
import useFeedSettings from '../useFeedSettings';
import { useFollowingQuery } from '../contentPreference/useFollowingQuery';
import { useAuthContext } from '../../contexts/AuthContext';
import { ContentPreferenceType } from '../../graphql/contentPreference';

export type UseFollowingFeed = {
  isActive: boolean;
};

export const useFollowingFeed = (): UseFollowingFeed => {
  const { user } = useAuthContext();
  const { feedSettings } = useFeedSettings();
  const queryResult = useFollowingQuery({
    id: user.id,
    entity: ContentPreferenceType.User,
  });

  const isActive = useMemo(() => {
    return (
      feedSettings?.includeSources?.length > 0 ||
      queryResult?.data?.pages?.length > 0
    );
  }, [feedSettings?.includeSources?.length, queryResult?.data?.pages?.length]);

  return {
    isActive,
  };
};
