import type { ReactElement } from 'react';
import React from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TourIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
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
  const { value: isNewD1Experience } = useConditionalFeature({
    feature: featureNewD1Experience,
    shouldEvaluate: isAuthReady && isLoggedIn && loadedSettings,
  });
  const { data } = useQuestDashboard();
  const introQuests = data?.intro ?? [];

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
  const buttonLabel = `${completed}/${introQuests.length}`;

  return (
    <Tooltip content="Introduction" side="bottom">
      <Button
        type="button"
        variant={isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary}
        size={ButtonSize.Medium}
        icon={<TourIcon />}
        onClick={() => openModal({ type: LazyModal.IntroQuests })}
        aria-label={`Open introduction quests (${buttonLabel})`}
      >
        {buttonLabel}
      </Button>
    </Tooltip>
  );
}

export default IntroQuestButton;
