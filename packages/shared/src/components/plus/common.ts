import type { UserShortProfile } from '../../lib/user';

export interface PlusPageProps {
  giftUser?: UserShortProfile;
  isGiftingUi: boolean;
  onUserChange: (user: UserShortProfile) => void;
}
