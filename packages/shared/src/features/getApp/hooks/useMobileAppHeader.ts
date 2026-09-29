import { useAuthContext } from '../../../contexts/AuthContext';
import { useMedia } from '../../../hooks/useMedia';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { isIOSNative } from '../../../lib/func';

// Logged-out phones only. The native wrappers render this same shell, and
// nobody should be told to open an app they are already in.
export const useMobileAppHeader = (): boolean => {
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    isAuthReady && !isLoggedIn && !isTablet && !isAndroidApp && !isIOSNative()
  );
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
