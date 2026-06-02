import { useAuthContext } from '../../contexts/AuthContext';
import { featureLayoutV2 } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useViewSize, ViewSize } from '../useViewSize';

interface UseLayoutVariant {
  isV2: boolean;
  isLoading: boolean;
}

export const useLayoutVariant = (): UseLayoutVariant => {
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

  return {
    isV2: shouldEvaluate && value === true,
    isLoading,
  };
};
