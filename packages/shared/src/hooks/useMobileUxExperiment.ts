import { useFeature } from '../components/GrowthBookProvider';
import { feature } from '../lib/featureManagement';
import { MobileUXLayout } from '../lib/featureValues';
import { useViewSize, ViewSize } from './useViewSize';

interface UseStreakExperiment {
  useNewMobileLayout: boolean;
}

export const useMobileUxExperiment = (): UseStreakExperiment => {
  const layout = useFeature(feature.mobileUxLayout);
  const isLaptop = useViewSize(ViewSize.Laptop);

  return {
    useNewMobileLayout: !isLaptop && layout === MobileUXLayout.V1,
  };
};
