import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TourIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { Bubble } from '../tooltips/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { ActionType } from '../../graphql/actions';
import { useActions } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { useViewSize, ViewSize } from '../../hooks';
import { LazyModal } from '../modals/common/types';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureNewD1Experience } from '../../lib/featureManagement';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { QuestStatus } from '../../graphql/quests';

export function IntroQuestButton(): ReactElement | null {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { loadedSettings } = useSettingsContext();
  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { checkHasCompleted } = useActions();
  const { value: isNewD1Experience } = useConditionalFeature({
    feature: featureNewD1Experience,
    shouldEvaluate: isAuthReady && isLoggedIn && loadedSettings,
  });
  const { data } = useQuestDashboard();
  const introQuests = data?.intro ?? [];
  const hasViewedIntroQuests = checkHasCompleted(ActionType.ViewedIntroQuests);

  if (!isAuthReady || !loadedSettings || !isLoggedIn || !isNewD1Experience) {
    return null;
  }

  if (introQuests.length === 0) {
    return null;
  }

  const completed = introQuests.filter(
    ({ status }) =>
      status === QuestStatus.Completed || status === QuestStatus.Claimed,
  ).length;
  const hasClaimableIntroQuest = introQuests.some(({ claimable }) => claimable);
  const showAttentionBadge = !hasViewedIntroQuests || hasClaimableIntroQuest;
  const buttonLabel = `${completed}/${introQuests.length}`;

  return (
    <Tooltip content="Introduction" side="bottom">
      <Button
        type="button"
        variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
        size={ButtonSize.Medium}
        icon={<TourIcon />}
        className="relative"
        onClick={() => openModal({ type: LazyModal.IntroQuests })}
        aria-label={`Open introduction quests (${buttonLabel})${
          showAttentionBadge ? ', attention needed' : ''
        }`}
      >
        {showAttentionBadge && (
          <Bubble
            data-testid="intro-quest-attention-badge"
            className="-right-1 -top-1 size-5 !min-h-5 !min-w-5 !rounded-full !bg-accent-onion-default p-0"
          >
            !
          </Bubble>
        )}
        {buttonLabel}
      </Button>
    </Tooltip>
  );
}

export default IntroQuestButton;
