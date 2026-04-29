import React from 'react';
import type { ReactElement } from 'react';

import { HorizontalSeparator } from '../../utilities';
import { ProfileSection } from '../ProfileSection';
import { useDndContext } from '../../../contexts/DndContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import {
  MagicIcon,
  PauseIcon,
  PlayIcon,
  ShortcutsIcon,
  StoryIcon,
} from '../../icons';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { checkIsExtension } from '../../../lib/func';
import { useIsShortcutsHubEnabled } from '../../../features/shortcuts/hooks/useIsShortcutsHubEnabled';
import { useCustomizeNewTab } from '../../../features/customizeNewTab/CustomizeNewTabContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

export type ExtensionSectionProps = {
  /**
   * Called after the user picks the customize entry so the parent
   * ProfileMenu collapses the dropdown — without this the menu stays open
   * over the customize sidebar that's about to appear.
   */
  onClose?: () => void;
};

export const ExtensionSection = ({
  onClose,
}: ExtensionSectionProps): ReactElement | null => {
  const { isEnabled: isCustomizerEnabled, open: openCustomizer } =
    useCustomizeNewTab();
  const { logEvent } = useLogContext();
  const { openModal } = useLazyModal();
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { optOutCompanion, toggleOptOutCompanion } = useSettingsContext();
  const hubEnabled = useIsShortcutsHubEnabled();
  const shortcutsModal = hubEnabled
    ? LazyModal.ShortcutsManage
    : LazyModal.CustomLinks;

  if (!checkIsExtension()) {
    return null;
  }

  if (isCustomizerEnabled) {
    // Flagged-on path: the sidebar surfaces shortcuts, the DnD/Take-a-break
    // flow, and the companion toggle in a richer form, so we collapse the
    // legacy 3-entry list into one jump-into-customize entry.
    return (
      <>
        <HorizontalSeparator />
        <ProfileSection
          items={[
            {
              title: 'Customize new tab',
              icon: MagicIcon,
              onClick: () => {
                logEvent({
                  event_name: LogEvent.Click,
                  target_type: TargetType.CustomizeNewTab,
                  target_id: 'profile_menu',
                });
                openCustomizer();
                onClose?.();
              },
            },
          ]}
        />
      </>
    );
  }

  // Flag-off fallback — preserves the pre-customizer extension menu so
  // users in the control bucket see no behavioural change.
  return (
    <>
      <HorizontalSeparator />
      <ProfileSection
        items={[
          {
            title: 'Shortcuts',
            icon: ShortcutsIcon,
            onClick: () => openModal({ type: shortcutsModal }),
          },
          {
            title: `${isDndActive ? 'Resume' : 'Pause'} new tab`,
            icon: isDndActive ? PlayIcon : PauseIcon,
            onClick: () => setShowDnd?.(true),
          },
          {
            title: `${optOutCompanion ? 'Enable' : 'Disable'} companion widget`,
            icon: () => <StoryIcon secondary={!optOutCompanion} />,
            onClick: () => toggleOptOutCompanion(),
          },
        ]}
      />
    </>
  );
};
