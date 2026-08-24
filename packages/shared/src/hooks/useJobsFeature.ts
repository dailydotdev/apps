import { featureJobsUI } from '../lib/featureManagement';
import {
  useFeature,
  useFeaturesReadyContext,
} from '../components/GrowthBookProvider';

export const useJobsFeature = (): {
  isJobsEnabled: boolean;
  isLoading: boolean;
} => {
  const value = useFeature(featureJobsUI);
  const { ready } = useFeaturesReadyContext();
  const isLoading = !ready;

  return {
    isJobsEnabled: isLoading || !!value,
    isLoading,
  };
};
