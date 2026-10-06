import { useAuthContext } from '../../../contexts/AuthContext';
import { useMedia } from '../../../hooks/useMedia';
import { usePhoneBrowser } from './usePhoneBrowser';

export const useMobileAppHeader = (): boolean => {
  const { isLoggedIn } = useAuthContext();
  const isPhoneBrowser = usePhoneBrowser();

  return isPhoneBrowser && !isLoggedIn;
};

// Below 360px the post bar can't hold the Read label ("Watch video" is the
// widest) next to Log in and Open app, so it drops to its icon.
const readLabelQueries = ['(min-width: 360px)'];
const readLabelValues = [true];

export const useMobileAppHeaderIconOnlyRead = (): boolean => {
  const isMobileAppHeader = useMobileAppHeader();
  const hasRoomForLabel = useMedia(readLabelQueries, readLabelValues, false);

  return isMobileAppHeader && !hasRoomForLabel;
};
