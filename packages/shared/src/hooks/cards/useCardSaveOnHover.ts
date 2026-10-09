import { useAuthContext } from '../../contexts/AuthContext';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureCardSaveOnHover } from '../../lib/featureManagement';

interface UseCardSaveOnHoverProps {
  /**
   * Evaluate only where the treatment changes something (grid cards), so
   * users who never see a difference are not enrolled.
   */
  shouldEvaluate?: boolean;
}

/**
 * `card_save_on_hover`: grid cards show the bookmark in their header on
 * hover, and the action bar keeps today's order at 32px. Evaluated for
 * logged-in users only, so anonymous visitors are never enrolled.
 */
export const useCardSaveOnHover = ({
  shouldEvaluate = true,
}: UseCardSaveOnHoverProps = {}): boolean => {
  const { isAuthReady, user } = useAuthContext();
  const { value } = useConditionalFeature({
    feature: featureCardSaveOnHover,
    shouldEvaluate: isAuthReady && !!user && shouldEvaluate,
  });
  return value;
};
