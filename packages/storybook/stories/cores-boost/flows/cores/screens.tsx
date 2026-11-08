import type { ReactElement } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import {
  bunPost,
  DailyQuestsPage,
  QUEST_CLAIMED_EVENT,
  findNotificationRow,
  NotificationsPage,
  PostPage,
  SwapInPage,
} from '../../real/pages';
import { CoresNudgeStrip } from './CoresNudgeStrip';
import { AwardNotificationRow } from './AwardNotification';

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

/** Your own post on the real post page, with the nudge where the strip goes */
export const OwnPostScreen = ({
  balance,
  onBoost,
  showNudge = true,
}: {
  balance: number;
  onBoost?: () => void;
  showNudge?: boolean;
}): ReactElement => {
  const [isDismissed, setIsDismissed] = useState(false);

  return (
    <PostPage
      post={bunPost}
      banner={
        showNudge &&
        !isDismissed && (
          <CoresNudgeStrip
            balance={balance}
            onBoost={() => onBoost?.()}
            onClose={() => setIsDismissed(true)}
          />
        )
      }
    />
  );
};

/** The real notifications page, with the award row drawn as the flow fixes it */
export const NotificationsScreen = ({
  onViewWallet,
}: {
  onViewWallet?: () => void;
}): ReactElement => (
  <>
    <NotificationsPage />
    <SwapInPage find={findNotificationRow('gave you')}>
      <AwardNotificationRow onViewWallet={onViewWallet} />
    </SwapInPage>
  </>
);

/** The quest's card on the real page, which the access check changes */
export const findQuestCard = (): HTMLElement | null => {
  const claim = [...document.querySelectorAll('button')].find(
    (button) => button.textContent?.trim() === 'Claim',
  );
  let card = claim?.parentElement ?? null;
  while (card && !card.className.includes('border')) {
    card = card.parentElement;
  }
  return card;
};
