import type { ReactElement } from 'react';
import React, { useEffect, useRef } from 'react';
import { DailyQuestsPage, QUEST_CLAIMED_EVENT } from '../../real/pages';

// Screens the Cores flow stories share, each on the real production page it
// happens on (real/pages.tsx), inside CoresProviders' production shell.

/**
 * The real daily quests page with today's claimable quest. Claim is the
 * production QuestButton's, in the sidebar or on the page.
 */
export const QuestScreen = ({
  onClaimed,
}: {
  isClaimed?: boolean;
  onClaimed?: () => void;
}): ReactElement => {
  const claimed = useRef(onClaimed);
  claimed.current = onClaimed;

  useEffect(() => {
    let timeout: number | undefined;
    const onReward = () => {
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => claimed.current?.(), 1400);
    };
    window.addEventListener(QUEST_CLAIMED_EVENT, onReward);
    return () => {
      window.removeEventListener(QUEST_CLAIMED_EVENT, onReward);
      window.clearTimeout(timeout);
    };
  }, []);

  return <DailyQuestsPage />;
};
