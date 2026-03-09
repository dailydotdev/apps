import { useConditionalFeature } from './useConditionalFeature';
import { plusAgentsPositioningFeature } from '../lib/featureManagement';

export const usePlusPositioning = () => {
  const { value: isAgentPositioning } = useConditionalFeature({
    feature: plusAgentsPositioningFeature,
    shouldEvaluate: true,
  });

  return { isAgentPositioning };
};
