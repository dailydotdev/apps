import { useAuthContext } from '../../../contexts/AuthContext';
import { useMedia } from '../../../hooks/useMedia';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';

// Below laptop a visitor's sign-in lives in the page bar: on phones and
// tablets, in a browser tab and inside the apps alike. The bar's second
// button is what differs.
export const useMobileAppHeader = (): boolean => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);

  return isAuthReady && !isLaptop && !isLoggedIn;
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
