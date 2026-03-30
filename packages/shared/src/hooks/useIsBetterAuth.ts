import { useGrowthBookContext } from '../components/GrowthBookProvider';

export const useIsBetterAuth = (): boolean => {
  const { growthbook } = useGrowthBookContext();
  const authStrategy = growthbook?.getAttributes?.()?.authStrategy;
  return authStrategy === 'betterauth';
};
