import { useAuthContext } from '../../../contexts/AuthContext';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { isIOSNative, isPWA } from '../../../lib/func';

// Phones reading in a browser tab. The native wrappers and an installed PWA
// render this same shell, and nobody should be told to open an app, or to
// keep using the browser, from inside one.
export const usePhoneBrowser = (): boolean => {
  const { isAuthReady, isAndroidApp } = useAuthContext();
  const isTablet = useViewSize(ViewSize.Tablet);

  return (
    isAuthReady && !isTablet && !isAndroidApp && !isIOSNative() && !isPWA()
  );
};
