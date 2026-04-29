import type { ReactElement } from 'react';
import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { QuestButton } from '../quest/QuestButton';

interface QuestHeaderButtonProps {
  compact?: boolean;
}

export function QuestHeaderButton({
  compact = false,
}: QuestHeaderButtonProps): ReactElement | null {
  const { isLoggedIn, isAuthReady } = useAuthContext();
  const { loadedSettings, optOutQuestSystem } = useSettingsContext();

  if (!isAuthReady || !loadedSettings || !isLoggedIn || optOutQuestSystem) {
    return null;
  }

  return <QuestButton compact={compact} />;
}

export default QuestHeaderButton;
