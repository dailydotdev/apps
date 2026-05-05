import type { ReactElement } from 'react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import type { ModalProps } from './common/Modal';
import { Modal } from './common/Modal';
import { ModalClose } from './common/ModalClose';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { TourIcon } from '../icons';
import {
  QuestCard,
  QUEST_CLAIMED_STAMP_ANIMATION_MS,
  QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS,
  type QuestDestination,
} from '../quest/QuestCard';
import {
  QuestRewardFlightLayer,
  buildQuestRewardFlights,
  type QuestRewardFlight,
  type QuestRewardSource,
} from '../quest/QuestRewardAnimations';
import { ActionType } from '../../graphql/actions';
import type { QuestType } from '../../graphql/quests';
import { useLogContext } from '../../contexts/LogContext';
import { useActions } from '../../hooks';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { usePrompt } from '../../hooks/usePrompt';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { downloadBrowserExtension, webappUrl } from '../../lib/constants';
import { BrowserName, getCurrentBrowserName } from '../../lib/func';
import { LogEvent, TargetType } from '../../lib/log';

type IntroQuestFlightLayerState = {
  claimRotationId: string;
  flights: QuestRewardFlight[];
};

const introDestinationByEventType: Record<string, QuestDestination> = {
  notifications_enable: {
    label: 'Notifications',
    path: '/settings/notifications',
  },
  brief_generate: {
    label: 'Briefing',
    path: '/briefing/generate',
  },
  profile_complete: {
    label: 'Profile',
    path: '/settings/profile',
  },
};

const getExtensionIntroDestination = (
  browserName: BrowserName,
): QuestDestination | null => {
  switch (browserName) {
    case BrowserName.Edge:
      return {
        label: 'Edge Add-ons',
        href: downloadBrowserExtension,
        openInNewTab: true,
      };
    case BrowserName.Chrome:
    case BrowserName.Brave:
      return {
        label: 'Chrome Web Store',
        href: downloadBrowserExtension,
        openInNewTab: true,
      };
    default:
      return null;
  }
};

const padStep = (index: number): string =>
  `Step ${(index + 1).toString().padStart(2, '0')}`;

export const IntroQuestModal = ({
  onRequestClose,
  ...props
}: ModalProps): ReactElement => {
  const router = useRouter();
  const browserName = getCurrentBrowserName();
  const { logEvent } = useLogContext();
  const { completeAction } = useActions();
  const { showPrompt } = usePrompt();
  const { data, isPending, isError } = useQuestDashboard();
  const {
    mutate: claimQuestReward,
    isPending: isClaimPending,
    variables,
  } = useClaimQuestReward();
  const introQuests = data?.intro ?? [];
  const claimingQuestId = isClaimPending ? variables?.userQuestId : undefined;
  const [rewardFlightLayers, setRewardFlightLayers] = useState<
    IntroQuestFlightLayerState[]
  >([]);
  const [animatingClaimRotationIds, setAnimatingClaimRotationIds] = useState<
    string[]
  >([]);
  const [claimedStampRotationIds, setClaimedStampRotationIds] = useState<
    string[]
  >([]);
  const [
    animatingClaimedStampRotationIds,
    setAnimatingClaimedStampRotationIds,
  ] = useState<string[]>([]);
  const [deferredClaimedStampRotationIds, setDeferredClaimedStampRotationIds] =
    useState<string[]>([]);
  const loggedImpressionRef = useRef(false);
  const claimedStampTimersRef = useRef<number[]>([]);
  const claimedStampRotationIdSet = useMemo(
    () => new Set(claimedStampRotationIds),
    [claimedStampRotationIds],
  );
  const animatingClaimRotationIdSet = useMemo(
    () => new Set(animatingClaimRotationIds),
    [animatingClaimRotationIds],
  );
  const animatingClaimedStampRotationIdSet = useMemo(
    () => new Set(animatingClaimedStampRotationIds),
    [animatingClaimedStampRotationIds],
  );
  const deferredClaimedStampRotationIdSet = useMemo(
    () => new Set(deferredClaimedStampRotationIds),
    [deferredClaimedStampRotationIds],
  );
  const introDestinations = useMemo<Record<string, QuestDestination | null>>(
    () => ({
      ...introDestinationByEventType,
      extension_install: getExtensionIntroDestination(browserName),
    }),
    [browserName],
  );

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    if (!loggedImpressionRef.current) {
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.IntroQuestModal,
      });
      loggedImpressionRef.current = true;
    }

    completeAction(ActionType.ViewedIntroQuests);
  }, [completeAction, logEvent, props.isOpen]);

  useEffect(() => {
    if (props.isOpen) {
      return;
    }

    loggedImpressionRef.current = false;
  }, [props.isOpen]);

  const clearClaimedStampTimers = useCallback(() => {
    claimedStampTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    claimedStampTimersRef.current = [];
  }, []);

  const scheduleClaimedStampReveal = useCallback((claimRotationId: string) => {
    const revealTimerId = window.setTimeout(() => {
      setClaimedStampRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });
      setAnimatingClaimedStampRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });
      setDeferredClaimedStampRotationIds((current) =>
        current.filter((id) => id !== claimRotationId),
      );
      claimedStampTimersRef.current = claimedStampTimersRef.current.filter(
        (activeTimerId) => activeTimerId !== revealTimerId,
      );

      const animationTimerId = window.setTimeout(() => {
        setAnimatingClaimedStampRotationIds((current) =>
          current.filter((id) => id !== claimRotationId),
        );
        claimedStampTimersRef.current = claimedStampTimersRef.current.filter(
          (activeTimerId) => activeTimerId !== animationTimerId,
        );
      }, QUEST_CLAIMED_STAMP_ANIMATION_MS);

      claimedStampTimersRef.current.push(animationTimerId);
    }, QUEST_CLAIMED_STAMP_REVEAL_DELAY_MS);

    claimedStampTimersRef.current.push(revealTimerId);
  }, []);

  const handleRewardFlightLayerDone = useCallback(
    (claimRotationId: string) => {
      setRewardFlightLayers((current) =>
        current.filter((layer) => layer.claimRotationId !== claimRotationId),
      );
      setAnimatingClaimRotationIds((current) =>
        current.filter((id) => id !== claimRotationId),
      );
      scheduleClaimedStampReveal(claimRotationId);
    },
    [scheduleClaimedStampReveal],
  );

  const handleClaim = useCallback(
    (
      userQuestId: string,
      questId: string,
      questType: QuestType,
      rewardSources: QuestRewardSource[],
      claimRotationId: string,
    ) => {
      setAnimatingClaimRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });
      setClaimedStampRotationIds((current) =>
        current.filter((id) => id !== claimRotationId),
      );
      setAnimatingClaimedStampRotationIds((current) =>
        current.filter((id) => id !== claimRotationId),
      );
      setDeferredClaimedStampRotationIds((current) => {
        if (current.includes(claimRotationId)) {
          return current;
        }

        return [...current, claimRotationId];
      });

      claimQuestReward(
        { userQuestId, questId, questType },
        {
          onSuccess: () => {
            const nextFlights = buildQuestRewardFlights(rewardSources);

            if (!nextFlights.length) {
              setAnimatingClaimRotationIds((current) =>
                current.filter((id) => id !== claimRotationId),
              );
              scheduleClaimedStampReveal(claimRotationId);
              return;
            }

            setRewardFlightLayers((current) => [
              ...current.filter(
                (layer) => layer.claimRotationId !== claimRotationId,
              ),
              { claimRotationId, flights: nextFlights },
            ]);
          },
          onError: () => {
            setDeferredClaimedStampRotationIds((current) =>
              current.filter((id) => id !== claimRotationId),
            );
            setRewardFlightLayers((current) =>
              current.filter(
                (layer) => layer.claimRotationId !== claimRotationId,
              ),
            );
            setAnimatingClaimRotationIds((current) =>
              current.filter((id) => id !== claimRotationId),
            );
          },
        },
      );
    },
    [claimQuestReward, scheduleClaimedStampReveal],
  );

  const handleDestinationClick = useCallback(
    async (destination: QuestDestination) => {
      onRequestClose?.(undefined as never);

      if ('href' in destination) {
        if (destination.openInNewTab) {
          window.open(destination.href, '_blank', 'noopener,noreferrer');
          return;
        }

        window.location.assign(destination.href);
        return;
      }

      await router.push(`${webappUrl}${destination.path.replace(/^\//, '')}`);
    },
    [onRequestClose, router],
  );

  const handleHideIntroQuests = useCallback(async (): Promise<void> => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.IntroQuestModal,
      target_id: 'hide',
    });

    const shouldHide = await showPrompt({
      title: 'Hide intro quests?',
      description:
        'Are you sure you want to permanently hide the intro quests button?',
      okButton: {
        title: 'Yes, hide it',
      },
    });

    if (!shouldHide) {
      return;
    }

    await completeAction(ActionType.IntroQuestsCompleted);
    onRequestClose?.(undefined as never);
  }, [completeAction, logEvent, onRequestClose, showPrompt]);

  useEffect(() => {
    return () => {
      clearClaimedStampTimers();
    };
  }, [clearClaimedStampTimers]);

  return (
    <Modal
      {...props}
      kind={Modal.Kind.FlexibleCenter}
      size={Modal.Size.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
    >
      <ModalClose className="top-2" onClick={onRequestClose} />
      <Modal.Body className="gap-4 p-4 tablet:p-6">
        <div className="flex items-start gap-3 border-b border-border-subtlest-tertiary pb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float text-text-primary">
            <TourIcon />
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <h1 className="font-bold text-text-primary typo-title3">
              Intro quests
            </h1>
            <p className="mt-1 text-text-tertiary typo-callout">
              Get the most out of daily.dev with these quick wins.
            </p>
          </div>
        </div>

        {isPending && (
          <p className="text-text-tertiary typo-callout">Loading quests...</p>
        )}
        {isError && (
          <p className="text-text-tertiary typo-callout">
            Intro quests are unavailable right now.
          </p>
        )}
        {!isPending && !isError && introQuests.length === 0 && (
          <p className="text-text-tertiary typo-callout">
            You&apos;re all caught up — no intro quests to show.
          </p>
        )}

        {introQuests.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {introQuests.map((userQuest, index) => (
                <QuestCard
                  key={userQuest.rotationId}
                  quest={userQuest}
                  onClaim={handleClaim}
                  destination={introDestinations[userQuest.quest.eventType]}
                  onDestinationClick={handleDestinationClick}
                  showLevelSystem
                  isClaiming={claimingQuestId === userQuest.userQuestId}
                  isClaimAnimating={animatingClaimRotationIdSet.has(
                    userQuest.rotationId,
                  )}
                  showClaimedStamp={claimedStampRotationIdSet.has(
                    userQuest.rotationId,
                  )}
                  animateClaimedStamp={animatingClaimedStampRotationIdSet.has(
                    userQuest.rotationId,
                  )}
                  suppressPersistedClaimedStamp={deferredClaimedStampRotationIdSet.has(
                    userQuest.rotationId,
                  )}
                  eyebrow={padStep(index)}
                  showLockIcon={false}
                />
              ))}
            </div>
            <div className="flex justify-center border-t border-border-subtlest-tertiary pt-2">
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Small}
                onClick={handleHideIntroQuests}
              >
                Don&apos;t show me this again
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
      {rewardFlightLayers.map((layer) => (
        <QuestRewardFlightLayer
          key={layer.claimRotationId}
          flights={layer.flights}
          onDone={() => handleRewardFlightLayerDone(layer.claimRotationId)}
        />
      ))}
    </Modal>
  );
};

export default IntroQuestModal;
