import { useContext } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { LayoutVariantContext } from '../../contexts/LayoutVariantContext';
import { featureLayoutV2 } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useViewSize, ViewSize } from '../useViewSize';

interface UseLayoutVariant {
  isV2: boolean;
  isLoading: boolean;
}

export const useLayoutVariant = (): UseLayoutVariant => {
  const serverVariant = useContext(LayoutVariantContext);
  const { isAuthReady } = useAuthContext();
  // v2 chrome (rail, page-header strip, floating card) only renders at
  // laptop+ — on tablet we still serve the legacy SidebarTablet and the
  // legacy header. Gate evaluation on the same breakpoint so consumers
  // can treat `isV2` as the single source of truth (no separate
  // `useViewSize(ViewSize.Laptop)` check needed at the call site).
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldEvaluate = isAuthReady && isLaptop;
  const { value, isLoading } = useConditionalFeature({
    feature: featureLayoutV2,
    shouldEvaluate,
  });

  if (serverVariant) {
    return {
      // The shell is already in the HTML, so the flag is only read here to
      // keep its exposure logging unchanged. `isLaptop` is client-only and
      // would contradict what the server painted, so it applies from the
      // second render on: `isAuthReady` is false on the server and on the
      // first client render, which makes it the hydration boundary.
      isV2: serverVariant === 'v2' && (!isAuthReady || isLaptop),
      isLoading: false,
    };
  }

  return {
    isV2: shouldEvaluate && value === true,
    isLoading,
  };
};
