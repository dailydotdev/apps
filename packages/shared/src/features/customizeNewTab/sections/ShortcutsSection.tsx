import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import { EditIcon, ShortcutsIcon } from '../../../components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SidebarSection } from '../components/SidebarSection';
import { SidebarSwitchRow } from '../components/SidebarCompactRow';

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
        // Real button (not another row) so it reads unambiguously as a
        // clickable action. The previous SidebarActionRow looked like a
        // switch row with a missing toggle, which tested as confusing.
        <div className="px-2 pt-1">
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            icon={<EditIcon />}
            onClick={onEditShortcuts}
          >
            Edit shortcuts
          </Button>
        </div>
      ) : null}
    </SidebarSection>
  );
};
