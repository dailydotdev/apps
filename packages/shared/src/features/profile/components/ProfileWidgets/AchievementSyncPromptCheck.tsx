import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import type { PublicProfile } from '../../../../lib/user';
import { useAuthContext } from '../../../../contexts/AuthContext';
import { useAchievementSync } from '../../../../hooks/profile/useAchievementSync';
import { useActions } from '../../../../hooks';
import { useLazyModal } from '../../../../hooks/useLazyModal';
import { ActionType } from '../../../../graphql/actions';
import { LazyModal } from '../../../../components/modals/common/types';
import type { AchievementSyncResult } from '../../../../graphql/user/achievements';
import { AchievementSyncModal } from './AchievementSyncModal';

interface AchievementSyncPromptCheckProps {
  user: PublicProfile;
}

export function AchievementSyncPromptCheck({
  user,
}: AchievementSyncPromptCheckProps): ReactElement | null {
  const { user: loggedUser } = useAuthContext();
  const isOwner = loggedUser?.id === user.id;
  const { syncStatus, syncAchievements, isSyncing, isStatusPending } =
    useAchievementSync(user);
  const { isActionsFetched, checkHasCompleted } = useActions();
  const { openModal } = useLazyModal();
  const [syncResult, setSyncResult] = useState<AchievementSyncResult | null>(
    null,
  );
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  const handleSync = useCallback(async () => {
    if (!isOwner || isSyncing || syncStatus?.canSync === false) {
      return;
    }

    setSyncResult(null);
    setIsSyncModalOpen(true);

    try {
      const result = await syncAchievements();
      setSyncResult(result);
    } catch {
      setIsSyncModalOpen(false);
    }
  }, [isOwner, isSyncing, syncAchievements, syncStatus?.canSync]);

  useEffect(() => {
    if (
      !isActionsFetched ||
      !isOwner ||
      isStatusPending ||
      !syncStatus?.canSync ||
      checkHasCompleted(ActionType.AchievementSyncPrompt)
    ) {
      return;
    }

    openModal({
      type: LazyModal.AchievementSyncPrompt,
      props: { onSync: handleSync },
    });
  }, [
    isActionsFetched,
    isOwner,
    isStatusPending,
    syncStatus?.canSync,
    checkHasCompleted,
    openModal,
    handleSync,
  ]);

  if (!isSyncModalOpen) {
    return null;
  }

  return (
    <AchievementSyncModal
      isOpen={isSyncModalOpen}
      onRequestClose={() => setIsSyncModalOpen(false)}
      result={syncResult}
      isPending={isSyncing}
    />
  );
}
