import { useConditionalFeature } from './useConditionalFeature';
import { featureCompanionPermissionWidget } from '../lib/featureManagement';

export function useIsCompanionPermissionWidgetEnabled(
  shouldEvaluate: boolean,
): boolean {
  const { value: isEnabled } = useConditionalFeature({
    feature: featureCompanionPermissionWidget,
    shouldEvaluate,
  });

  return shouldEvaluate && !!isEnabled;
}
