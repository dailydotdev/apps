import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { useViewSize, ViewSize } from './useViewSize';

interface UseStreakExperiment {
  useNewMobileLayout: boolean;
}

export const useMobileUxExperiment = (): UseStreakExperiment => {
  const featureEnabled = useFeature(feature.mobileUxLayout);
  const isLaptop = useViewSize(ViewSize.Laptop);

  return {
    useNewMobileLayout: !isLaptop && featureEnabled,
  };
};
