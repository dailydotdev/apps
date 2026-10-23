import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostCommentsTeaser } from '../../lib/featureManagement';

/**
 * Whether this reader gets the comment teaser. Logged-out readers only: the
 * flag is not evaluated for members, so they are never enrolled.
 */
export const useCommentsTeaser = (): boolean => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const shouldEvaluate = isAuthReady && !isLoggedIn;
  const { value } = useConditionalFeature({
    feature: featurePostCommentsTeaser,
    shouldEvaluate,
  });

  return shouldEvaluate && !!value;
};
