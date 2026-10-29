import type { UserQuest } from '../../graphql/quests';
import { QuestStatus } from '../../graphql/quests';
import { ActionType } from '../../graphql/actions';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useActions } from '../../hooks';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureIntroQuestChecklist } from '../../lib/featureManagement';

interface IntroQuestEntry {
  introQuests: UserQuest[];
  shouldShow: boolean;
  isChecklist: boolean;
}

export const useIntroQuestEntry = (): IntroQuestEntry => {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { loadedSettings } = useSettingsContext();
  const { checkHasCompleted } = useActions();
  const { data } = useQuestDashboard();
  const introQuests = data?.intro ?? [];
  const allClaimed =
    introQuests.length > 0 &&
    introQuests.every(({ status }) => status === QuestStatus.Claimed);
  const shouldShow =
    isAuthReady &&
    loadedSettings &&
    isLoggedIn &&
    introQuests.length > 0 &&
    !allClaimed &&
    !checkHasCompleted(ActionType.IntroQuestsCompleted);
  const { value: isChecklist } = useConditionalFeature({
    feature: featureIntroQuestChecklist,
    shouldEvaluate: shouldShow,
  });

  return { introQuests, shouldShow, isChecklist: shouldShow && isChecklist };
};
