import { useQuery } from '@tanstack/react-query';

import { DevCardTheme } from '../../components/profile/devcard/common';
import { Source } from '../../graphql/sources';
import { DEV_CARD_QUERY } from '../../graphql/users';
import { cloudinary } from '../../lib/image';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { PublicProfile } from '../../lib/user';
import { useRequestProtocol } from '../useRequestProtocol';

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
  const { data, isLoading } = useQuery<DevCardQueryData>(
    generateQueryKey(RequestKey.DevCard, { id: userId }),
    async () => {
      const res = await requestMethod(DEV_CARD_QUERY, {
        id: userId,
      });

      return res;
    },
    { staleTime: StaleTime.Default, enabled: !!userId },
  );

  const { devCard, userStreakProfile } = data || {};

  const { isProfileCover, user } = devCard ?? {};
  const coverImage =
    (isProfileCover ? user.cover : undefined) ??
    cloudinary.devcard.defaultCoverImage;

  return {
    devcard: {
      ...devCard,
      streak: { ...userStreakProfile },
    },
    isLoading,
    coverImage,
  };
};
