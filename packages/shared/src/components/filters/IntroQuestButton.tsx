import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TourIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { Bubble } from '../tooltips/utils';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { ActionType } from '../../graphql/actions';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useConditionalFeature } from '../../hooks/useConditionalFeature';
import { featureNewD1Experience } from '../../lib/featureManagement';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { QuestStatus } from '../../graphql/quests';

const INTRO_QUEST_CTA = 'Get the most out of daily.dev';
const INTRO_QUEST_CTA_DURATION_MS = 2000;

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
  const allIntroQuestsClaimed =
    introQuests.length > 0 &&
    introQuests.every(({ status }) => status === QuestStatus.Claimed);
  const hasViewedIntroQuests = checkHasCompleted(ActionType.ViewedIntroQuests);
  const [isIntroCtaVisible, setIsIntroCtaVisible] = useState(false);
  const hasShownIntroCta = useRef(false);
  const shouldRenderButton =
    isAuthReady &&
    loadedSettings &&
    isLoggedIn &&
    isNewD1Experience &&
    introQuests.length > 0 &&
    !allIntroQuestsClaimed;
  const showIntroCta =
    shouldRenderButton && (!hasShownIntroCta.current || isIntroCtaVisible);

  useEffect(() => {
    if (!shouldRenderButton || hasShownIntroCta.current) {
      return undefined;
    }

    hasShownIntroCta.current = true;
    setIsIntroCtaVisible(true);
    const timeout = setTimeout(
      () => setIsIntroCtaVisible(false),
      INTRO_QUEST_CTA_DURATION_MS,
    );

    return () => clearTimeout(timeout);
  }, [shouldRenderButton]);

  if (!shouldRenderButton) {
    return null;
  }

  const completed = introQuests.filter(
    ({ status }) =>
      status === QuestStatus.Completed || status === QuestStatus.Claimed,
  ).length;
  const hasClaimableIntroQuest = introQuests.some(({ claimable }) => claimable);
  const showAttentionBadge = !hasViewedIntroQuests || hasClaimableIntroQuest;
  const buttonLabel = `${completed}/${introQuests.length}`;
  const buttonVariant = isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary;

  return (
    <Tooltip content="Introduction" side="bottom">
      <Button
        type="button"
        variant={buttonVariant}
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
        <span className="flex min-w-0 items-center">
          <span
            aria-hidden="true"
            data-testid="intro-quest-cta"
            data-expanded={showIntroCta ? 'true' : 'false'}
            className={classNames(
              'inline-flex shrink-0 items-center overflow-hidden whitespace-nowrap rounded-10 transition-all duration-500 ease-out motion-reduce:transition-none',
              showIntroCta
                ? 'mr-2 max-w-[18rem] bg-background-subtle px-3 py-1 opacity-100'
                : 'mr-0 max-w-0 bg-background-subtle px-0 py-0 opacity-0',
            )}
          >
            <span className="min-w-max font-bold typo-footnote">
              {INTRO_QUEST_CTA}
            </span>
          </span>
          <span className="shrink-0">{buttonLabel}</span>
        </span>
      </Button>
    </Tooltip>
  );
}

export default IntroQuestButton;
