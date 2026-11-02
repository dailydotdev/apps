import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureListCardLargeActions } from '../../lib/featureManagement';

export const useListCardLargeActions = ({
  shouldEvaluate,
}: {
  shouldEvaluate: boolean;
}): boolean => {
  const { isAuthReady, user } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureListCardLargeActions,
    shouldEvaluate: shouldEvaluate && isAuthReady && !!user,
  });
  return value;
};
