import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useMedia } from '../../../hooks/useMedia';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import {
  featureMobileAppHeader,
  featureMobileAppHeaderDeclutter,
} from '../../../lib/featureManagement';
import { isIOSNative } from '../../../lib/func';

// Logged-out phones only. The native wrappers render this same shell, and
// nobody should be told to open an app they are already in.
export const useMobileAppHeader = (): boolean => {
  const { isAuthReady, isLoggedIn, isAndroidApp } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);
  const shouldEvaluate =
    isAuthReady && !isLoggedIn && !isTablet && !isAndroidApp && !isIOSNative();
  const { value: isEnabled } = useConditionalFeature({
    feature: featureMobileAppHeader,
    shouldEvaluate,
  });

  return shouldEvaluate && isEnabled;
};

export const useMobileAppHeaderDeclutter = (): boolean => {
  const isMobileAppHeader = useMobileAppHeader();
  const { value: isDecluttered } = useConditionalFeature({
    feature: featureMobileAppHeaderDeclutter,
    shouldEvaluate: isMobileAppHeader,
  });

  return isMobileAppHeader && isDecluttered;
};

// Below 375px the post bar can't hold the Read label ("Watch video" is the
// widest) next to its menu, Log in and Open app, so it drops to its icon.
const readLabelQueries = ['(min-width: 375px)'];
const readLabelValues = [true];

export const useMobileAppHeaderIconOnlyRead = (): boolean => {
  const isMobileAppHeader = useMobileAppHeader();
  const hasRoomForLabel = useMedia(readLabelQueries, readLabelValues, false);

  return isMobileAppHeader && !hasRoomForLabel;
};
