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
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SidebarSection } from '../components/SidebarSection';
import {
  SidebarActionRow,
  SidebarSwitchRow,
} from '../components/SidebarCompactRow';
import {
  SidebarSegmented,
  type SegmentedOption,
} from '../components/SidebarSegmented';

type ShortcutSource = 'browser' | 'custom';

const SOURCE_OPTIONS: SegmentedOption<ShortcutSource>[] = [
  { value: 'browser', label: 'Top sites' },
  { value: 'custom', label: 'Custom' },
];

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
        if (!hasCheckedPermission) {
          askTopSitesPermission();
        } else {
          onRevokePermission();
        }
      } else {
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
        <div className="flex flex-col gap-1 px-1 pt-1">
          <div className="flex min-w-0 items-center justify-between gap-3 px-1 py-1">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="shrink-0"
            >
              Source
            </Typography>
            <div className="flex min-w-0 max-w-[60%] flex-1">
              <SidebarSegmented
                value={activeSource}
                options={SOURCE_OPTIONS}
                onChange={onSwitchSource}
                ariaLabel="Shortcut source"
              />
            </div>
          </div>
          <SidebarActionRow
            label="Edit shortcuts"
            icon={EditIcon}
            onClick={onEditShortcuts}
          />
        </div>
      ) : null}
    </SidebarSection>
  );
};
