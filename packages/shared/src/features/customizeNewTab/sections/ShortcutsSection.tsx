import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import { EditIcon, ShortcutsIcon } from '../../../components/icons';
import { SidebarSection } from '../components/SidebarSection';
import {
  SidebarActionRow,
  SidebarSwitchRow,
} from '../components/SidebarCompactRow';

export const ShortcutsSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { showTopSites, toggleShowTopSites, customLinks } =
    useSettingsContext();
  const { hasCheckedPermission, setShowPermissionsModal } = useShortcuts();
  const hasCustomLinks = (customLinks?.length ?? 0) > 0;

  const onToggle = useCallback(() => {
    const nextValue = !showTopSites;

    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'show_top_sites',
      extra: JSON.stringify({ enabled: nextValue }),
    });

    if (nextValue && !hasCheckedPermission && !hasCustomLinks) {
      setShowPermissionsModal(true);
      return;
    }

    toggleShowTopSites();
  }, [
    hasCheckedPermission,
    hasCustomLinks,
    logEvent,
    setShowPermissionsModal,
    showTopSites,
    toggleShowTopSites,
  ]);

  const onEditShortcuts = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'edit_shortcuts',
    });
    openModal({ type: LazyModal.CustomLinks });
  }, [logEvent, openModal]);

  return (
    <SidebarSection title="Shortcuts">
      <SidebarSwitchRow
        name="newtab-customizer-shortcuts"
        label="Show shortcuts"
        description="A row of quick-access sites above your feed."
        icon={ShortcutsIcon}
        checked={showTopSites}
        onToggle={onToggle}
      />
      {showTopSites ? (
        <SidebarActionRow
          label="Edit shortcuts"
          description="Pick between top sites and custom links."
          icon={EditIcon}
          onClick={onEditShortcuts}
        />
      ) : null}
    </SidebarSection>
  );
};
