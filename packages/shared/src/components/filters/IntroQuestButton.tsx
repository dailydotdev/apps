import type { ReactElement } from 'react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverAnchor, PopoverArrow } from '@radix-ui/react-popover';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TourIcon } from '../icons';
import { Tooltip } from '../tooltip/Tooltip';
import { Bubble } from '../tooltips/utils';
import { PopoverContent } from '../popover/Popover';
import { RootPortal } from '../tooltips/Portal';
import { Typography, TypographyType } from '../typography/Typography';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { ActionType } from '../../graphql/actions';
import { useActions, useViewSize, ViewSize } from '../../hooks';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { useNewD1ExperienceFeature } from '../../hooks/useNewD1ExperienceFeature';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { QuestStatus } from '../../graphql/quests';

const useElementRect = (
  ref: React.RefObject<HTMLElement>,
  active: boolean,
): DOMRect | null => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!active || !ref.current || typeof window === 'undefined') {
      setRect(null);
      return undefined;
    }

    const update = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const observer = new ResizeObserver(update);
    observer.observe(ref.current);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      observer.disconnect();
    };
  }, [ref, active]);

  return rect;
};

export function IntroQuestButton(): ReactElement | null {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { loadedSettings } = useSettingsContext();
  const { openModal } = useLazyModal();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { value: isNewD1Experience } = useNewD1ExperienceFeature({
    shouldEvaluate: isAuthReady && isLoggedIn && loadedSettings,
  });
  const { data } = useQuestDashboard();
  const introQuests = data?.intro ?? [];
  const allIntroQuestsClaimed =
    introQuests.length > 0 &&
    introQuests.every(({ status }) => status === QuestStatus.Claimed);
  const hasViewedIntroQuests = checkHasCompleted(ActionType.ViewedIntroQuests);
  const hasCompletedIntroQuests = checkHasCompleted(
    ActionType.IntroQuestsCompleted,
  );
  const hasAcknowledgedIntro = checkHasCompleted(ActionType.IntroAcknowledged);
  const shouldRenderButton =
    isAuthReady &&
    loadedSettings &&
    isLoggedIn &&
    isNewD1Experience &&
    introQuests.length > 0 &&
    !allIntroQuestsClaimed &&
    !hasCompletedIntroQuests;
  const showCoachmark =
    shouldRenderButton &&
    isActionsFetched &&
    !hasAcknowledgedIntro &&
    !hasViewedIntroQuests;
  const anchorRef = useRef<HTMLSpanElement>(null);
  const anchorRect = useElementRect(anchorRef, showCoachmark);

  useEffect(() => {
    if (
      shouldRenderButton &&
      isActionsFetched &&
      !hasAcknowledgedIntro &&
      hasViewedIntroQuests
    ) {
      completeAction(ActionType.IntroAcknowledged);
    }
  }, [
    shouldRenderButton,
    isActionsFetched,
    hasAcknowledgedIntro,
    hasViewedIntroQuests,
    completeAction,
  ]);

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

  const handleClick = () => {
    if (showCoachmark) {
      completeAction(ActionType.IntroAcknowledged);
    }
    openModal({ type: LazyModal.IntroQuests });
  };

  const buttonElement = (
    <Button
      type="button"
      variant={buttonVariant}
      size={ButtonSize.Medium}
      icon={<TourIcon />}
      className="relative"
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
      {buttonLabel}
    </Button>
  );

  return (
    <>
      {showCoachmark && (
        <RootPortal>
          <div
            data-testid="intro-quest-coachmark-overlay"
            aria-hidden
            className="fixed inset-0 z-modal bg-overlay-quaternary-onion"
          />
          {anchorRect && (
            <div
              data-testid="intro-quest-coachmark-spotlight"
              className="fixed z-max rounded-12 bg-background-default"
              style={{
                top: anchorRect.top,
                left: anchorRect.left,
                width: anchorRect.width,
                height: anchorRect.height,
              }}
            >
              {buttonElement}
            </div>
          )}
        </RootPortal>
      )}
      <Popover open={showCoachmark}>
        <Tooltip content="Introduction" side="bottom" visible={!showCoachmark}>
          <PopoverAnchor asChild>
            <span
              ref={anchorRef}
              className={classNames(
                'inline-flex',
                showCoachmark && 'invisible',
              )}
              aria-hidden={showCoachmark || undefined}
            >
              {buttonElement}
            </span>
          </PopoverAnchor>
        </Tooltip>
        <PopoverContent
          data-testid="intro-quest-coachmark-bubble"
          side="right"
          align="center"
          sideOffset={12}
          collisionPadding={16}
          avoidCollisions
          onOpenAutoFocus={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="z-max max-w-[18rem] rounded-12 bg-text-primary px-4 py-3 text-surface-invert"
        >
          <Typography type={TypographyType.Callout} bold>
            Check out our introductory quests to get you set up!
          </Typography>
          <PopoverArrow className="fill-text-primary" width={12} height={6} />
        </PopoverContent>
      </Popover>
    </>
  );
}

export default IntroQuestButton;
