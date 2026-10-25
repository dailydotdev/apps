import { useAuthContext } from '../../contexts/AuthContext';
import { featureLayoutV2Fixes } from '../../lib/featureManagement';
import { useConditionalFeature } from '../useConditionalFeature';
import { useLaptopLayout } from './useLaptopLayout';

// The layout v2 fixes only exist on the laptop shell for logged-in readers, so
// the flag is evaluated (and the reader enrolled) only there.
export const useLayoutV2Fixes = (): boolean => {
  const { isLoggedIn } = useAuthContext();
  const isLaptopLayout = useLaptopLayout();
  const shouldEvaluate = isLoggedIn && isLaptopLayout;
  const { value } = useConditionalFeature({
    feature: featureLayoutV2Fixes,
    shouldEvaluate,
  });

  return shouldEvaluate && value;
};
