import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { useQuestUpdates } from '../../hooks/useQuestUpdates';

const QuestUpdatesSubscriber = (): null => {
  useQuestUpdates();
  return null;
};

// Renderless, always-mounted listener that keeps the quest dashboard cache in
// sync with server-side quest progress regardless of which screen is showing.
// Mount this once at the layout level alongside `InAppNotificationElement`.
// Gating mirrors `QuestHeaderButton` so we only open the subscription for
// logged-in users who haven't opted out of the quest system; mounting/
// unmounting the subscriber controls the subscription lifecycle.
export function QuestUpdatesListener(): ReactElement | null {
  const { isAuthReady, isLoggedIn } = useAuthContext();
  const { loadedSettings, optOutQuestSystem } = useSettingsContext();

  if (!isAuthReady || !loadedSettings || !isLoggedIn || optOutQuestSystem) {
    return null;
  }

  return <QuestUpdatesSubscriber />;
}

export default QuestUpdatesListener;
