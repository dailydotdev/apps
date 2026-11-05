import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import ProfileButton from '@dailydotdev/shared/src/components/profile/ProfileButton';
import Logo, { LogoPosition } from '@dailydotdev/shared/src/components/Logo';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { QuestRewardType } from '@dailydotdev/shared/src/graphql/quests';
import type { QuestRewardCounterEventDetail } from '@dailydotdev/shared/src/lib/questRewardAnimation';
import { QUEST_REWARD_COUNTER_EVENT } from '@dailydotdev/shared/src/lib/questRewardAnimation';

// A thin app header around the flow screens, so the production ProfileButton
// (streak · Cores · reputation pill) shows the balance change.

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

export const Shell = ({
  children,
  headerAddon,
}: {
  children: ReactNode;
  headerAddon?: ReactNode;
}): ReactElement => {
  // react-modal binds to #__next, so screens with a modal mount after it
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div
      id="__next"
      className="flex min-h-screen flex-col bg-background-default"
    >
      <header className="sticky top-0 z-3 flex h-14 items-center gap-3 border-b border-border-subtlest-tertiary bg-background-default px-4">
        <Logo position={LogoPosition.Initial} compact />
        <div className="ml-auto flex items-center gap-3">
          {headerAddon}
          <ProfileButton />
        </div>
      </header>
      <div className="flex flex-1 flex-col">{isMounted && children}</div>
    </div>
  );
};
