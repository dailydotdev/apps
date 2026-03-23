import { createContext, useContext } from 'react';
import type { UserShortProfile } from '../../lib/user';

export interface GiftUserContextData {
  giftToUser?: UserShortProfile;
}
export const GiftUserContext = createContext<GiftUserContextData>(
  {} as GiftUserContextData,
);

export const useGiftUserContext = (): GiftUserContextData =>
  useContext(GiftUserContext);
