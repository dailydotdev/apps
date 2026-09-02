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

// v2 chrome (rail, page-header strip, floating card) only renders at laptop+ —
// on tablet we still serve the legacy SidebarTablet and the legacy header.
// Gate evaluation on the same breakpoint so consumers can treat `isV2` as the
// single source of truth (no separate `useViewSize(ViewSize.Laptop)` check
// needed at the call site).
export const useLayoutVariantFlag = (): UseLayoutVariant => {
  const { isAuthReady } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const shouldEvaluate = isAuthReady && isLaptop;
  const { value, isLoading } = useConditionalFeature({
    feature: featureLayoutV2,
    shouldEvaluate,
  });

  return {
    isV2: shouldEvaluate && value === true,
    isLoading,
  };
};

export const useLayoutVariant = (): UseLayoutVariant => {
  const serverVariant = useContext(LayoutVariantContext);
  const { isAuthReady } = useAuthContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { isV2, isLoading } = useLayoutVariantFlag();

  // The shell the mirrored route painted stands only until the flag can
  // contradict it, so turning `layout_v2` off takes effect on this render
  // rather than the next hard navigation. `isLaptop` is client-only and would
  // contradict what the server painted, so it applies from the second render
  // on: `isAuthReady` is false on the server and on the first client render,
  // which makes it the hydration boundary.
  if (serverVariant && isLoading) {
    return {
      isV2: serverVariant === 'v2' && (!isAuthReady || isLaptop),
      isLoading: false,
    };
  }

  return { isV2, isLoading: serverVariant ? false : isLoading };
};
