import {
  useFeature,
  useFeaturesReadyContext,
} from '../components/GrowthBookProvider';
import { questsFeature } from '../lib/featureManagement';

export const useAchievementRewardDisplay = (): {
  showAchievementXp: boolean;
} => {
  const { ready } = useFeaturesReadyContext();
  const isQuestsFeatureEnabled = useFeature(questsFeature);

  return {
    showAchievementXp: ready && isQuestsFeatureEnabled === true,
  };
};
