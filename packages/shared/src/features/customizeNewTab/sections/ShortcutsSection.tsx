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
  ButtonGroup,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SidebarSection } from '../components/SidebarSection';
import { SidebarSwitch } from '../components/SidebarSwitch';

type ShortcutSource = 'browser' | 'custom';

export const ShortcutsSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { showTopSites, toggleShowTopSites, customLinks } =
    useSettingsContext();
  const {
    hasCheckedPermission,
    setShowPermissionsModal,
    askTopSitesPermission,
    onRevokePermission,
    isManual,
  } = useShortcuts();
  const hasCustomLinks = (customLinks?.length ?? 0) > 0;

  const activeSource: ShortcutSource = isManual ? 'custom' : 'browser';

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

  const onSwitchSource = useCallback(
    (source: ShortcutSource) => {
      if (source === activeSource) {
        return;
      }

      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'shortcuts_source',
        extra: JSON.stringify({ source }),
      });

      if (source === 'browser') {
        // Going back to the browser's own top sites: drop the "manual" flag
        // if it was set purely because the user had custom links, and re-ask
        // for permission if we've never checked.
        if (!hasCheckedPermission) {
          askTopSitesPermission();
        } else {
          onRevokePermission();
        }
      } else {
        // Custom mode: open the links modal so the user can populate the list
        // immediately. Revoking permissions here would surprise the user, so
        // we just flip the manual flag via onRevokePermission().
        onRevokePermission();
        openModal({ type: LazyModal.CustomLinks });
      }
    },
    [
      activeSource,
      askTopSitesPermission,
      hasCheckedPermission,
      logEvent,
      onRevokePermission,
      openModal,
    ],
  );

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

      <div
        className={
          showTopSites
            ? 'flex flex-col gap-3'
            : 'flex flex-col gap-3 opacity-50'
        }
      >
        <div className="flex items-center justify-between gap-4">
          <Typography
            color={TypographyColor.Tertiary}
            type={TypographyType.Subhead}
          >
            Data source
          </Typography>
          <ButtonGroup>
            <Button
              variant={
                activeSource === 'browser'
                  ? ButtonVariant.Float
                  : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
              onClick={() => onSwitchSource('browser')}
              className={
                activeSource === 'browser' ? 'text-text-primary' : undefined
              }
              disabled={!showTopSites}
            >
              Top sites
            </Button>
            <Button
              variant={
                activeSource === 'custom'
                  ? ButtonVariant.Float
                  : ButtonVariant.Tertiary
              }
              size={ButtonSize.XSmall}
              onClick={() => onSwitchSource('custom')}
              className={
                activeSource === 'custom' ? 'text-text-primary' : undefined
              }
              disabled={!showTopSites}
            >
              Custom
            </Button>
          </ButtonGroup>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          onClick={onEditShortcuts}
          disabled={!showTopSites}
        >
          Edit shortcuts
        </Button>
      </div>
    </SidebarSection>
  );
};
