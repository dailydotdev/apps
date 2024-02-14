import { useQuery } from '@tanstack/react-query';
import { DevCardTheme } from '../../components/profile/devcard/common';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { graphqlUrl } from '../../lib/config';
import { DEV_CARD_QUERY } from '../../graphql/users';
import { useRequestProtocol } from '../useRequestProtocol';
import { PublicProfile } from '../../lib/user';
import { Source } from '../../graphql/sources';
import { cloudinary } from '../../lib/image';

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
}

export interface UseDevCard {
  devcard: DevCardData;
  isLoading: boolean;
  coverImage: string;
}

export const useDevCard = (userId: string): UseDevCard => {
  const { requestMethod } = useRequestProtocol();
  const { data: devcard, isLoading } = useQuery<DevCardData>(
    generateQueryKey(RequestKey.DevCard, { id: userId }),
    async () => {
      const res = await requestMethod(graphqlUrl, DEV_CARD_QUERY, {
        id: userId,
      });

      return res.devCard;
    },
    { staleTime: StaleTime.Default, enabled: !!userId },
  );

  const { isProfileCover, user } = devcard ?? {};
  const coverImage =
    (isProfileCover ? user.cover : undefined) ??
    cloudinary.devcard.defaultCoverImage;

  return { devcard, isLoading, coverImage };
};
