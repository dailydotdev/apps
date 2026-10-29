import type { ReactNode } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { UserQuest } from '../../graphql/quests';
import { ActionType } from '../../graphql/actions';
import { BriefingType } from '../../graphql/posts';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { useActions, useToastNotification } from '../../hooks';
import { useClaimQuestReward } from '../../hooks/useClaimQuestReward';
import { usePrompt } from '../../hooks/usePrompt';
import { useQuestDashboard } from '../../hooks/useQuestDashboard';
import { useEventListener } from '../../hooks/useEventListener';
import { usePushNotificationMutation } from '../../hooks/notifications/usePushNotificationMutation';
import { useCreatePersonalAccessToken } from '../../hooks/api/usePersonalAccessTokens';
import { useGenerateBrief } from '../briefing/hooks/useGenerateBrief';
import { downloadBrowserExtension, webappUrl } from '../../lib/constants';
import {
  BrowserName,
  checkIsExtension,
  getCurrentBrowserName,
  isMobile,
} from '../../lib/func';
import { LogEvent, NotificationPromptSource, TargetType } from '../../lib/log';
import type { IntroQuestPhase } from './introQuestSteps';
import {
  IntroQuestEventType,
  getIntroQuestPhase,
  getIntroQuestStep,
  getQuestCores,
  getQuestXp,
  isIntroQuestDone,
  sortIntroQuests,
} from './introQuestSteps';

const WAITING_REFETCH_MS = 4000;
const WAITING_TIMEOUT_MS = 5 * 60 * 1000;

const extensionBrowsers = [
  BrowserName.Chrome,
  BrowserName.Brave,
  BrowserName.Edge,
];

export const getApiProfileCommand = (token?: string): string =>
  `curl -H "Authorization: Bearer ${
    token ?? 'YOUR_API_KEY'
  }" https://api.daily.dev/public/v1/profile`;

type NotificationPermissionState = 'default' | 'granted' | 'denied';

const readNotificationPermission = (): NotificationPermissionState =>
  (globalThis.Notification?.permission as NotificationPermissionState) ??
  'default';

interface IntroQuestChecklistProps {
  onRequestClose: () => void;
  children?: ReactNode;
}

const [IntroQuestChecklistProvider, useIntroQuestChecklist] =
  createContextProvider(({ onRequestClose }: IntroQuestChecklistProps) => {
    const router = useRouter();
    const { user } = useAuthContext();
    const { logEvent } = useLogContext();
    const { displayToast } = useToastNotification();
    const { completeAction, checkHasCompleted, isActionsFetched } =
      useActions();
    const { showPrompt } = usePrompt();
    const { data, isPending, isError, refetch } = useQuestDashboard();
    const { mutate: claimQuestReward } = useClaimQuestReward();
    const { onEnablePush } = usePushNotificationMutation();
    const { mutateAsync: createToken, isPending: isCreatingToken } =
      useCreatePersonalAccessToken();
    const [started, setStarted] = useState<string[]>([]);
    const [claiming, setClaiming] = useState<string[]>([]);
    const [token, setToken] = useState<string>();
    const [notificationPermission, setNotificationPermission] =
      useState<NotificationPermissionState>(readNotificationPermission);
    const loggedImpressionRef = useRef(false);

    const markStarted = useCallback((eventType: string) => {
      setStarted((current) =>
        current.includes(eventType) ? current : [...current, eventType],
      );
    }, []);

    const { isGenerating, generate } = useGenerateBrief({
      onGenerated: () => {
        markStarted(IntroQuestEventType.BriefGenerate);
        refetch();
      },
    });

    const browserName = getCurrentBrowserName();
    const canInstallExtension =
      !checkIsExtension() &&
      !isMobile() &&
      extensionBrowsers.includes(browserName);
    const isFirstBrief =
      isActionsFetched && !checkHasCompleted(ActionType.GeneratedBrief);
    const isBriefFree = isFirstBrief || !!user?.isPlus;

    const quests = useMemo(() => sortIntroQuests(data?.intro ?? []), [data]);

    const isWorking = useCallback(
      (quest: UserQuest): boolean => {
        switch (quest.quest.eventType) {
          case IntroQuestEventType.BriefGenerate:
            return isGenerating || started.includes(quest.quest.eventType);
          case IntroQuestEventType.ApiTokenCreate:
            return isCreatingToken || started.includes(quest.quest.eventType);
          default:
            return started.includes(quest.quest.eventType);
        }
      },
      [isCreatingToken, isGenerating, started],
    );

    const phaseOf = useCallback(
      (quest: UserQuest): IntroQuestPhase =>
        getIntroQuestPhase(quest, isWorking(quest)),
      [isWorking],
    );

    const blockedBy = useCallback(
      (quest: UserQuest): UserQuest | undefined => {
        const requires = getIntroQuestStep(quest)?.requires;

        if (!requires) {
          return undefined;
        }

        const required = quests.find(
          (item) => item.quest.eventType === requires,
        );

        return required && !isIntroQuestDone(required) ? required : undefined;
      },
      [quests],
    );

    const isUnsupported = useCallback(
      (quest: UserQuest): boolean =>
        quest.quest.eventType === IntroQuestEventType.ExtensionInstall &&
        !canInstallExtension,
      [canInstallExtension],
    );

    const readyQuests = quests.filter((quest) => phaseOf(quest) === 'ready');
    const doneCount = quests.filter(isIntroQuestDone).length;
    const currentQuest =
      readyQuests[0] ??
      quests.find(
        (quest) =>
          phaseOf(quest) !== 'claimed' &&
          !blockedBy(quest) &&
          !isUnsupported(quest),
      ) ??
      quests.find((quest) => phaseOf(quest) !== 'claimed');
    const totals = quests.reduce(
      (acc, quest) => ({
        xp: acc.xp + getQuestXp(quest),
        cores: acc.cores + getQuestCores(quest),
      }),
      { xp: 0, cores: 0 },
    );

    useEffect(() => {
      if (loggedImpressionRef.current) {
        return;
      }

      loggedImpressionRef.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.IntroQuestModal,
      });
      completeAction(ActionType.ViewedIntroQuests);
      refetch();
    }, [completeAction, logEvent, refetch]);

    const isWaiting = quests.some((quest) => phaseOf(quest) === 'working');

    useEffect(() => {
      if (!isWaiting) {
        return undefined;
      }

      const interval = setInterval(() => refetch(), WAITING_REFETCH_MS);
      const timeout = setTimeout(() => {
        clearInterval(interval);
        setStarted([]);
      }, WAITING_TIMEOUT_MS);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }, [isWaiting, refetch]);

    useEventListener(globalThis.window, 'focus', () => {
      setNotificationPermission(readNotificationPermission());
      refetch();
    });

    const logClick = useCallback(
      (targetId: string, extra?: Record<string, unknown>) =>
        logEvent({
          event_name: LogEvent.Click,
          target_type: TargetType.IntroQuestModal,
          target_id: targetId,
          ...(extra && { extra: JSON.stringify(extra) }),
        }),
      [logEvent],
    );

    const navigate = useCallback(
      (path: string) => {
        onRequestClose();
        router.push(path);
      },
      [onRequestClose, router],
    );

    const copyText = useCallback(
      async (text: string, message: string): Promise<boolean> => {
        try {
          await globalThis.navigator.clipboard.writeText(text);
          displayToast(message);
          return true;
        } catch {
          displayToast('Your browser blocked the clipboard');
          return false;
        }
      },
      [displayToast],
    );

    const start = useCallback(
      async (quest: UserQuest): Promise<void> => {
        const { eventType } = quest.quest;
        logClick(eventType);

        switch (eventType) {
          case IntroQuestEventType.ExtensionInstall:
            if (!canInstallExtension) {
              await copyText(downloadBrowserExtension, 'Install link copied');
              return;
            }
            markStarted(eventType);
            globalThis.window.open(
              downloadBrowserExtension,
              '_blank',
              'noopener,noreferrer',
            );
            return;
          case IntroQuestEventType.PostRead:
            navigate(webappUrl);
            return;
          case IntroQuestEventType.NotificationsEnable: {
            if (readNotificationPermission() === 'denied') {
              setNotificationPermission('denied');
              return;
            }
            markStarted(eventType);
            const isGranted = await onEnablePush(
              NotificationPromptSource.IntroQuests,
            );
            setNotificationPermission(readNotificationPermission());
            if (isGranted) {
              await refetch();
            }
            setStarted((current) => current.filter((id) => id !== eventType));
            return;
          }
          case IntroQuestEventType.BriefGenerate:
            if (!isBriefFree) {
              navigate(`${webappUrl}briefing/generate`);
              return;
            }
            generate({ type: BriefingType.Daily });
            return;
          case IntroQuestEventType.ProfileComplete:
            navigate(`${webappUrl}settings/profile`);
            return;
          case IntroQuestEventType.ApiTokenCreate:
            try {
              const created = await createToken({
                name: 'daily.dev setup',
                expiresInDays: null,
              });
              setToken(created.token);
              markStarted(eventType);
              await refetch();
            } catch {
              displayToast('We couldn’t create your key. Please try again.');
            }
            return;
          case IntroQuestEventType.ApiProfileFetch:
            if (await copyText(getApiProfileCommand(token), 'Command copied')) {
              markStarted(eventType);
            }
            return;
          default:
            navigate(webappUrl);
        }
      },
      [
        canInstallExtension,
        copyText,
        createToken,
        displayToast,
        generate,
        isBriefFree,
        logClick,
        markStarted,
        navigate,
        onEnablePush,
        refetch,
        token,
      ],
    );

    const recheckNotifications = useCallback(() => {
      const permission = readNotificationPermission();
      setNotificationPermission(permission);

      if (permission === 'denied') {
        displayToast('Notifications are still blocked in your browser');
      }
    }, [displayToast]);

    const claim = useCallback(
      (quest: UserQuest): Promise<void> => {
        const { userQuestId } = quest;

        if (!userQuestId) {
          return Promise.resolve();
        }

        setClaiming((current) => [...current, quest.rotationId]);

        return new Promise((resolve) => {
          claimQuestReward(
            {
              userQuestId,
              questId: quest.quest.id,
              questType: quest.quest.type,
            },
            {
              onError: () =>
                displayToast('We couldn’t claim that reward. Try again.'),
              onSettled: () => {
                setClaiming((current) =>
                  current.filter((id) => id !== quest.rotationId),
                );
                resolve();
              },
            },
          );
        });
      },
      [claimQuestReward, displayToast],
    );

    const claimAll = useCallback(async () => {
      logClick('claim all', { count: readyQuests.length });
      await readyQuests.reduce(
        (previous, quest) => previous.then(() => claim(quest)),
        Promise.resolve(),
      );
    }, [claim, logClick, readyQuests]);

    const hide = useCallback(async () => {
      logClick('hide');
      const shouldHide = await showPrompt({
        title: 'Hide your setup list?',
        description:
          'You can still do every step on your own. The rewards stay unclaimed.',
        okButton: { title: 'Hide it' },
      });

      if (!shouldHide) {
        return;
      }

      await completeAction(ActionType.IntroQuestsCompleted);
      onRequestClose();
    }, [completeAction, logClick, onRequestClose, showPrompt]);

    return {
      quests,
      isPending,
      isError,
      refetch,
      phaseOf,
      blockedBy,
      isUnsupported,
      isClaiming: (quest: UserQuest) => claiming.includes(quest.rotationId),
      isClaimingAny: claiming.length > 0,
      readyQuests,
      doneCount,
      currentQuest,
      totals,
      token,
      notificationPermission,
      browserName,
      isBriefFree,
      start,
      claim,
      claimAll,
      hide,
      navigate,
      copyText,
      recheckNotifications,
      onRequestClose,
    };
  });

export { IntroQuestChecklistProvider, useIntroQuestChecklist };
