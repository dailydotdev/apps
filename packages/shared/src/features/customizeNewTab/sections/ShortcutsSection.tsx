import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { useShortcuts } from '../../shortcuts/contexts/ShortcutsProvider';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SidebarSection } from '../components/SidebarSection';
import { SidebarSwitch } from '../components/SidebarSwitch';

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

    // Turning ON without prior permission / custom links: route through the
    // existing permissions modal so users can pick browser top sites vs custom.
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
    <SidebarSection
      title="Shortcuts"
      description="Pin your go-to sites so they're one click away on every new tab."
    >
      <SidebarSwitch
        name="newtab-customizer-shortcuts"
        label="Show shortcuts"
        description="Display a row of quick-access sites above your feed."
        checked={showTopSites}
        onToggle={onToggle}
      />
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        onClick={onEditShortcuts}
        disabled={!showTopSites}
      >
        Edit shortcuts
      </Button>
    </SidebarSection>
  );
};
