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
    // Keep this as the resolved flag value. Route gates can choose to render
    // optimistically while `isLoading`; passive UI should treat unknown as off.
    isJobsEnabled: !!value,
    isLoading,
  };
};
