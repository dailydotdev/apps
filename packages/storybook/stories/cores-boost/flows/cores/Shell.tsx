import type { ReactElement, ReactNode } from 'react';
import React, { useCallback } from 'react';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QuestRewardType } from '@dailydotdev/shared/src/graphql/quests';
import type { QuestRewardCounterEventDetail } from '@dailydotdev/shared/src/lib/questRewardAnimation';
import { QUEST_REWARD_COUNTER_EVENT } from '@dailydotdev/shared/src/lib/questRewardAnimation';

const emit = (detail: QuestRewardCounterEventDetail) =>
  window.dispatchEvent(
    new CustomEvent<QuestRewardCounterEventDetail>(QUEST_REWARD_COUNTER_EVENT, {
      detail,
    }),
  );

const HITS = 5;
const HIT_MS = 140;

/**
 * Counts the header Cores pill up the way a quest claim does (the production
 * QuestButton events), then stores the new balance on the user.
 */
export const useAnimateCores = (): ((delta: number) => void) => {
  const { user, updateUser } = useAuthContext();

  return useCallback(
    (delta: number) => {
      if (!user) {
        return;
      }

      const base = user.balance.amount;
      const claimId = `sb-${Date.now()}`;
      const step = Math.ceil(delta / HITS);

      emit({
        phase: 'start',
        rewardType: QuestRewardType.Cores,
        claimId,
        baseValue: base,
        clearAfterMs: HITS * HIT_MS + 600,
      });
      Array.from({ length: HITS }).forEach((_, index) => {
        window.setTimeout(
          () =>
            emit({
              phase: 'hit',
              rewardType: QuestRewardType.Cores,
              claimId,
              delta: Math.min(step, delta - step * index),
            }),
          (index + 1) * HIT_MS,
        );
      });
      window.setTimeout(
        () => updateUser({ ...user, balance: { amount: base + delta } }),
        HITS * HIT_MS + 300,
      );
    },
    [updateUser, user],
  );
};

/** The screen inside the production app shell (see CoresProviders) */
export const Shell = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-1 flex-col">{children}</div>
);
