import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ChecklistBIcon } from '../icons/ChecklistB';
import { Tooltip } from '../tooltip/Tooltip';
import { Bubble } from '../tooltips/utils';
import { ActionType } from '../../graphql/actions';
import { QuestStatus } from '../../graphql/quests';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { IntroQuestSetupButton } from '../../features/introQuests/IntroQuestSetupButton';
import { useIntroQuestEntry } from '../../features/introQuests/useIntroQuestEntry';

const INTRO_QUEST_CTA = 'Get the most out of daily.dev';
const INTRO_QUEST_CTA_DURATION_MS = 2000;
const INTRO_QUEST_CTA_COLLAPSE_MS = 500;
const NUDGE_SHAKE_INTERVAL_MS = 5_000;
const NUDGE_SHAKE_DURATION_MS = 600;

interface IntroQuestButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  // Names the button beside the count, where a row has the room.
  showLabel?: boolean;
}

export function IntroQuestButton({
  size = ButtonSize.Medium,
  variant,
  showLabel = false,
}: IntroQuestButtonProps = {}): ReactElement | null {
  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { checkHasCompleted } = useActions();
  const {
    introQuests,
    shouldShow: shouldRenderButton,
    isChecklist,
  } = useIntroQuestEntry();
  const hasViewedIntroQuests = checkHasCompleted(ActionType.ViewedIntroQuests);
  const [isIntroCtaVisible, setIsIntroCtaVisible] = useState(false);
  const [hasIntroCtaFinished, setHasIntroCtaFinished] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const hasShownIntroCta = useRef(false);
  const hasClickedRef = useRef(false);
  const shouldNudge = shouldRenderButton && !isChecklist;
  const showIntroCta =
    shouldRenderButton && (!hasShownIntroCta.current || isIntroCtaVisible);

  useEffect(() => {
    if (!shouldNudge || hasShownIntroCta.current) {
      return undefined;
    }

    hasShownIntroCta.current = true;
    setIsIntroCtaVisible(true);
    const visibilityTimeout = setTimeout(
      () => setIsIntroCtaVisible(false),
      INTRO_QUEST_CTA_DURATION_MS,
    );
    const finishedTimeout = setTimeout(
      () => setHasIntroCtaFinished(true),
      INTRO_QUEST_CTA_DURATION_MS + INTRO_QUEST_CTA_COLLAPSE_MS,
    );

    return () => {
      clearTimeout(visibilityTimeout);
      clearTimeout(finishedTimeout);
    };
  }, [shouldNudge]);

  useEffect(() => {
    if (!shouldNudge || !hasIntroCtaFinished || hasClickedRef.current) {
      return undefined;
    }

    const triggerShake = () => {
      if (hasClickedRef.current) {
        return;
      }
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), NUDGE_SHAKE_DURATION_MS);
    };

    triggerShake();
    const interval = setInterval(triggerShake, NUDGE_SHAKE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [shouldNudge, hasIntroCtaFinished]);

  if (!shouldRenderButton) {
    return null;
  }

  if (isChecklist) {
    return <IntroQuestSetupButton quests={introQuests} size={size} />;
  }

  const completed = introQuests.filter(
    ({ status }) =>
      status === QuestStatus.Completed || status === QuestStatus.Claimed,
  ).length;
  const hasClaimableIntroQuest = introQuests.some(({ claimable }) => claimable);
  const showAttentionBadge = !hasViewedIntroQuests || hasClaimableIntroQuest;
  const buttonLabel = `${completed}/${introQuests.length}`;
  const buttonVariant =
    variant ?? (isLaptop ? ButtonVariant.Float : ButtonVariant.Tertiary);

  const handleClick = () => {
    hasClickedRef.current = true;
    setIsShaking(false);
    openModal({ type: LazyModal.IntroQuests });
  };

  return (
    <Tooltip content="Introduction" side="bottom">
      <Button
        type="button"
        variant={buttonVariant}
        size={size}
        icon={<ChecklistBIcon />}
        className={classNames(
          'relative',
          isShaking && 'animate-nudge-shake motion-reduce:animate-none',
        )}
        onClick={handleClick}
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
          <span className="shrink-0">
            {showLabel ? `Getting started · ${buttonLabel}` : buttonLabel}
          </span>
        </span>
      </Button>
    </Tooltip>
  );
}

export default IntroQuestButton;
