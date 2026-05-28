import React from 'react';
import type { ReactElement } from 'react';

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
import type { ProfileSectionItemProps } from '../ProfileSectionItem';

/**
 * Hook returning the "Customize new tab" item when the feature flag is
 * on, or `null` when it isn't. The ProfileMenu renders the entry as its
 * own one-item section, sitting above the legacy ExtensionSection block.
 */
export const useCustomizeNewTabMenuItem = (
  onClose?: () => void,
): ProfileSectionItemProps | null => {
  const { isEnabled, open } = useCustomizeNewTab();
  const { logEvent } = useLogContext();

  if (!checkIsExtension() || !isEnabled) {
    return null;
  }

  return {
    title: 'Customize new tab',
    icon: MagicIcon,
    onClick: () => {
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'profile_menu',
      });
      open('profile_menu');
      onClose?.();
    },
  };
};

/**
 * Legacy fallback for users in the control bucket of the customize
 * sidebar feature flag. When the flag is on, the customize entry is
 * surfaced via `useCustomizeNewTabMenuItem` and this component renders
 * nothing.
 */
export const ExtensionSection = (): ReactElement | null => {
  const { isEnabled: isCustomizerEnabled } = useCustomizeNewTab();
  const { openModal } = useLazyModal();
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { optOutCompanion, toggleOptOutCompanion } = useSettingsContext();
  const hubEnabled = useIsShortcutsHubEnabled();
  const shortcutsModal = hubEnabled
    ? LazyModal.ShortcutsManage
    : LazyModal.CustomLinks;

  if (!checkIsExtension() || isCustomizerEnabled) {
    return null;
  }

  return (
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
  );
};
