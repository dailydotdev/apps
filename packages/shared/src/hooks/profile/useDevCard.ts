import { useQuery } from '@tanstack/react-query';
import type { DevCardTheme } from '../../components/profile/devcard/common';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { DEV_CARD_QUERY } from '../../graphql/users';
import { useRequestProtocol } from '../useRequestProtocol';
import type { PublicProfile } from '../../lib/user';
import type { Source } from '../../graphql/sources';
import { cloudinaryDevcardDefaultCoverImage } from '../../lib/image';

export interface DevCardData {
  id: string;
  user: PublicProfile;
  createdAt: string;
  theme: DevCardTheme;
  isProfileCover: boolean;
  showBorder: boolean;
  reputation: number;
  articlesRead: number;
  tags: string[];
  sources: Source[];
  streak: {
    max: number;
  };
}

export interface DevCardQueryData {
  devCard: DevCardData;
  userStreakProfile: {
    max: number;
  };
}

export interface UseDevCard {
  devcard: DevCardData;
  isLoading: boolean;
  coverImage: string;
}

export const useDevCard = (userId: string): UseDevCard => {
  const { requestMethod } = useRequestProtocol();
  const { data, isLoading } = useQuery<DevCardQueryData>({
    queryKey: generateQueryKey(RequestKey.DevCard, { id: userId }),

    queryFn: async () =>
      await requestMethod(DEV_CARD_QUERY, {
        id: userId,
      }),
    staleTime: StaleTime.Default,
    enabled: !!userId,
  });

  const { devCard, userStreakProfile } = data || {};

  const { isProfileCover, user } = devCard ?? {};
  const coverImage =
    (isProfileCover ? user.cover : undefined) ??
    cloudinaryDevcardDefaultCoverImage;

  return {
    devcard: {
      ...devCard,
      streak: { ...userStreakProfile },
    },
    isLoading,
    coverImage,
  };
};
