import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
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
