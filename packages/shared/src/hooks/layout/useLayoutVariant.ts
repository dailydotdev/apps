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
  const isTabletUp = useViewSize(ViewSize.Tablet);
  const shouldEvaluate = isAuthReady && isTabletUp;
  const { value, isLoading } = useConditionalFeature({
    feature: featureLayoutV2,
    shouldEvaluate,
  });

  return {
    isV2: shouldEvaluate && value === true,
    isLoading,
  };
};
