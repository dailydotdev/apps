import { useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { QuestDashboard, QuestType } from '../graphql/quests';
import {
  QUEST_ROTATION_UPDATE_SUBSCRIPTION,
  QUEST_UPDATE_SUBSCRIPTION,
} from '../graphql/quests';
import { useQuestDashboard } from './useQuestDashboard';
import useSubscription from './useSubscription';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { generateQueryKey, RequestKey } from '../lib/query';
import { LogEvent, TargetType } from '../lib/log';

type ClaimableQuestSnapshot = {
  rotationId: string;
  questId: string;
  questType: QuestType;
  userQuestId: string | null;
  locked: boolean;
  claimable: boolean;
};

const getQuestClaimableSnapshots = (
  dashboard?: QuestDashboard,
): Map<string, ClaimableQuestSnapshot> => {
  const snapshots = new Map<string, ClaimableQuestSnapshot>();

  if (!dashboard) {
    return snapshots;
  }

  [
    ...dashboard.daily.regular,
    ...dashboard.daily.plus,
    ...dashboard.weekly.regular,
    ...dashboard.weekly.plus,
    ...dashboard.milestone,
  ].forEach((quest) => {
    snapshots.set(quest.rotationId, {
      rotationId: quest.rotationId,
      questId: quest.quest.id,
      questType: quest.quest.type,
      userQuestId: quest.userQuestId ?? null,
      locked: quest.locked,
      claimable: quest.claimable,
    });
  });

  return snapshots;
};

// Keeps the quest dashboard cache in sync with server-side quest progress.
//
// Quest completion is detected asynchronously on the backend (CDC workers for
// upvotes/comments/etc., mutations for client-tracked events) and broadcast
// over `QUEST_UPDATE_SUBSCRIPTION`. The badge counts can only react to those
// events while something is subscribed, and Redis pub/sub has no replay — so
// this must live in an always-mounted listener (see `QuestUpdatesListener`)
// rather than inside the header `QuestButton`, which isn't rendered on every
// screen. Otherwise completions that land while the button is unmounted are
// lost and the badge stays stale until an unrelated refetch.
export const useQuestUpdates = (): void => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { data, dataUpdatedAt } = useQuestDashboard();

  const questDashboardQueryKey = generateQueryKey(
    RequestKey.QuestDashboard,
    user,
  );
  const invalidateQuestDashboard = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: questDashboardQueryKey,
      exact: true,
    });
  }, [queryClient, questDashboardQueryKey]);

  const shouldLogClaimableQuestRef = useRef(false);
  const previousClaimableQuestSnapshotsRef = useRef<Map<
    string,
    ClaimableQuestSnapshot
  > | null>(null);
  const previousQuestDashboardUpdatedAtRef = useRef<number | null>(null);
  const handleQuestDashboardRefresh = useCallback(() => {
    shouldLogClaimableQuestRef.current = true;
    invalidateQuestDashboard();
  }, [invalidateQuestDashboard]);

  useSubscription(
    () => ({
      query: QUEST_UPDATE_SUBSCRIPTION,
    }),
    {
      next: handleQuestDashboardRefresh,
    },
    [user?.id],
  );

  useSubscription(
    () => ({
      query: QUEST_ROTATION_UPDATE_SUBSCRIPTION,
    }),
    {
      next: handleQuestDashboardRefresh,
    },
    [user?.id],
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    const currentClaimableQuestSnapshots = getQuestClaimableSnapshots(data);
    const currentQuestDashboardUpdatedAt = dataUpdatedAt;
    const didReceiveFreshQuestDashboard =
      previousQuestDashboardUpdatedAtRef.current !==
      currentQuestDashboardUpdatedAt;

    if (
      shouldLogClaimableQuestRef.current &&
      didReceiveFreshQuestDashboard &&
      previousClaimableQuestSnapshotsRef.current
    ) {
      currentClaimableQuestSnapshots.forEach((quest) => {
        const previousQuest = previousClaimableQuestSnapshotsRef.current?.get(
          quest.rotationId,
        );

        if (!quest.locked && !previousQuest?.claimable && quest.claimable) {
          logEvent({
            event_name: LogEvent.QuestClaimable,
            target_id: quest.questId,
            target_type: TargetType.Quest,
            extra: JSON.stringify({
              questType: quest.questType,
              userQuestId: quest.userQuestId,
              userId: user?.id,
              rotationId: quest.rotationId,
            }),
          });
        }
      });

      shouldLogClaimableQuestRef.current = false;
    }

    previousClaimableQuestSnapshotsRef.current = currentClaimableQuestSnapshots;
    previousQuestDashboardUpdatedAtRef.current = currentQuestDashboardUpdatedAt;
  }, [data, dataUpdatedAt, logEvent, user?.id]);
};
