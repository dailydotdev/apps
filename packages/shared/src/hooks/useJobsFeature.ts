import { featureJobsUI } from '../lib/featureManagement';
import { useConditionalFeature } from './useConditionalFeature';

export const useJobsFeature = (): {
  isJobsEnabled: boolean;
  isLoading: boolean;
} => {
  const { value, isLoading } = useConditionalFeature({
    feature: featureJobsUI,
  });

  return {
    isJobsEnabled: !!value,
    isLoading,
  };
};
