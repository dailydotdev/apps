import { createContext, useContext } from 'react';
import type { UserShortProfile } from '../../lib/user';

interface GiftUserContextData {
  giftingUser?: UserShortProfile;
  onUserChange: (user: UserShortProfile) => void;
}
export const GiftUserContext = createContext<GiftUserContextData | null>(null);

export const useGiftUserContext = (): GiftUserContextData =>
  useContext(GiftUserContext);
