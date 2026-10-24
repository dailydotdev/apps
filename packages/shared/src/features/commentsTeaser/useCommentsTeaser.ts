import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featurePostCommentsTeaser } from '../../lib/featureManagement';

interface UseCommentsTeaser {
  isCommentsTeaser: boolean;
  isPending: boolean;
}

/**
 * Whether this reader gets the comment teaser. Logged-out readers only: the
 * flag is not evaluated for members, so they are never enrolled.
 */
export const useCommentsTeaser = (enabled = true): UseCommentsTeaser => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const shouldEvaluate = enabled && isAuthReady && !isLoggedIn;
  const { value, isLoading } = useConditionalFeature({
    feature: featurePostCommentsTeaser,
    shouldEvaluate,
  });

  return {
    isCommentsTeaser: shouldEvaluate && !isLoading && !!value,
    isPending: shouldEvaluate && isLoading,
  };
};
