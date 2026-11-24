import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import type { ApiErrorResult } from '../graphql/common';
import type {
  QuestDashboard,
  RefreshQuestData,
  UserQuest,
} from '../graphql/quests';
import { REFRESH_QUEST_MUTATION } from '../graphql/quests';
import type { TargetId } from '../lib/log';
import { LogEvent, Origin, TargetType } from '../lib/log';
import { generateQueryKey, RequestKey } from '../lib/query';
import { getPathnameWithQuery } from '../lib/links';
import { webappUrl } from '../lib/constants';
import { isExtension } from '../lib/func';
import { useRequestProtocol } from './useRequestProtocol';
import { useTransactionError } from './useTransactionError';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';

type RefreshQuestArgs = {
  quest: UserQuest;
};

const getQuestRefreshLogExtra = (quest: UserQuest) => ({
  questId: quest.quest.id,
  questType: quest.quest.type,
  userQuestId: quest.userQuestId,
  rotationId: quest.rotationId,
  cost: quest.refreshCost,
});

const findRefreshedQuest = (
  result: RefreshQuestData['refreshQuest'],
  userQuestId: string,
): UserQuest | undefined =>
  [
    ...result.daily.regular,
    ...result.daily.plus,
    ...result.weekly.regular,
    ...result.weekly.plus,
  ].find((quest) => quest.userQuestId === userQuestId);

export const useRefreshQuest = ({ targetId }: { targetId: TargetId }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, updateUser } = useAuthContext();
  const { logEvent } = useLogContext();
  const { requestMethod } = useRequestProtocol();
  const onTransactionError = useTransactionError();
  const questDashboardKey = generateQueryKey(RequestKey.QuestDashboard, user);

  const logRefreshEvent = useCallback(
    (
      eventName: LogEvent,
      quest: UserQuest,
      extra: Record<string, unknown> = {},
    ) =>
      logEvent({
        event_name: eventName,
        target_id: targetId,
        target_type: TargetType.Quest,
        extra: JSON.stringify({
          ...getQuestRefreshLogExtra(quest),
          ...extra,
        }),
      }),
    [logEvent, targetId],
  );

  const mutation = useMutation({
    mutationFn: async ({ quest }: RefreshQuestArgs) => {
      const result = await requestMethod<RefreshQuestData>(
        REFRESH_QUEST_MUTATION,
        {
          userQuestId: quest.userQuestId,
        },
      );

      return result.refreshQuest;
    },
    onSuccess: async (refreshResult, { quest }) => {
      logRefreshEvent(LogEvent.RefreshQuest, quest, {
        newQuestId: findRefreshedQuest(
          refreshResult,
          quest.userQuestId as string,
        )?.quest.id,
      });

      queryClient.setQueryData<QuestDashboard | undefined>(
        questDashboardKey,
        (currentDashboard) =>
          currentDashboard && {
            ...currentDashboard,
            level: refreshResult.level,
            daily: refreshResult.daily,
            weekly: refreshResult.weekly,
            milestone: refreshResult.milestone,
            intro: refreshResult.intro,
          },
      );
      await queryClient.invalidateQueries({
        queryKey: generateQueryKey(RequestKey.Transactions, user),
        exact: false,
      });

      if (user && quest.refreshCost) {
        await updateUser({
          ...user,
          balance: {
            amount: user.balance.amount - quest.refreshCost,
          },
        });
      }
    },
    onError: async (error: ApiErrorResult, { quest }) => {
      logRefreshEvent(LogEvent.RefreshQuestError, quest, {
        error: error.response?.errors?.[0]?.message,
      });
      await onTransactionError(error);
      queryClient.invalidateQueries({ queryKey: questDashboardKey });
    },
  });

  const refreshQuest = useCallback(
    async (quest: UserQuest) => {
      if (!user || !quest.userQuestId || !quest.refreshCost) {
        return;
      }

      if (user.balance.amount < quest.refreshCost) {
        const searchParams = new URLSearchParams();
        searchParams.set('origin', Origin.QuestRefresh);

        if (!isExtension) {
          searchParams.set('next', router.asPath);
        }

        await router.push(
          getPathnameWithQuery(`${webappUrl}cores`, searchParams),
        );

        return;
      }

      await mutation.mutateAsync({ quest }).catch(() => undefined);
    },
    [mutation, router, user],
  );

  return {
    refreshQuest,
    logRefreshEvent,
    refreshingQuestId: mutation.isPending
      ? (mutation.variables?.quest.userQuestId ?? undefined)
      : undefined,
  };
};

export const useOpenQuestRefresh = ({ targetId }: { targetId: TargetId }) => {
  const { openModal } = useLazyModal();
  const { logEvent } = useLogContext();

  return useCallback(
    (quest: UserQuest) => {
      logEvent({
        event_name: LogEvent.OpenQuestRefresh,
        target_id: targetId,
        target_type: TargetType.Quest,
        extra: JSON.stringify(getQuestRefreshLogExtra(quest)),
      });
      openModal({
        type: LazyModal.QuestRefresh,
        props: { quest, targetId },
      });
    },
    [logEvent, openModal, targetId],
  );
};
