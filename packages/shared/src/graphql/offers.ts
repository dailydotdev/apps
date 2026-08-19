import { gql } from 'graphql-request';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey } from '../lib/query';
import { gqlClient } from './common';

export enum OfferPlacement {
  StreakMilestone = 'STREAK_MILESTONE',
}

export type UserOffer = {
  impressionUid: string;
  clickUrl: string;
  title: string;
  description?: string;
  imageUrl?: string;
  advertiserName: string;
  advertiserLogo?: string;
  perk?: string;
  badgeLabel?: 'free_trial' | 'discount';
};

export const USER_OFFERS_QUERY = gql`
  query UserOffers($placement: OfferPlacement!) {
    userOffers(placement: $placement) {
      impressionUid
      clickUrl
      title
      description
      imageUrl
      advertiserName
      advertiserLogo
      perk
      badgeLabel
    }
  }
`;

export const CONFIRM_OFFERS_DELIVERED_MUTATION = gql`
  mutation ConfirmOffersDelivered($impressionUids: [ID!]!) {
    confirmOffersDelivered(impressionUids: $impressionUids) {
      _
    }
  }
`;

export const getUserOffers = async (
  placement: OfferPlacement,
): Promise<UserOffer[]> => {
  const result = await gqlClient.request<{ userOffers: UserOffer[] }>(
    USER_OFFERS_QUERY,
    { placement },
  );

  return result.userOffers;
};

export const confirmOffersDelivered = (
  impressionUids: string[],
): Promise<unknown> =>
  gqlClient.request(CONFIRM_OFFERS_DELIVERED_MUTATION, { impressionUids });

export const userOffersQueryOptions = ({
  user,
  placement,
}: {
  user: Pick<LoggedUser, 'id'> | undefined | null;
  placement: OfferPlacement;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.UserOffers,
    user ?? undefined,
    placement,
  ),
  queryFn: () => getUserOffers(placement),
  // Offer click links are tokenized and expire server-side, so offers must
  // never be cached or reused across moments.
  staleTime: 0,
  gcTime: 0,
  retry: false,
  refetchOnWindowFocus: false,
});
