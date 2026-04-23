import React from 'react';
import type { ReactElement } from 'react';

import { HorizontalSeparator } from '../../utilities';
import { ProfileSection } from '../ProfileSection';
import { useDndContext } from '../../../contexts/DndContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { PauseIcon, PlayIcon, ShortcutsIcon, StoryIcon } from '../../icons';
import { useLazyModal } from '../../../hooks/useLazyModal';
import { LazyModal } from '../../modals/common/types';
import { checkIsExtension } from '../../../lib/func';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { featureShortcutsHub } from '../../../lib/featureManagement';

export const ExtensionSection = (): ReactElement | null => {
  const { openModal } = useLazyModal();
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { optOutCompanion, toggleOptOutCompanion } = useSettingsContext();
  const { user } = useAuthContext();
  // Route "Shortcuts" in the profile menu to the same modal the user sees
  // elsewhere. On the new hub that's ShortcutsManage (settings-like); on
  // the legacy hub it's still CustomLinks. Gating this through the same
  // feature flag keeps the menu consistent with the row on the new tab.
  const { value: hubEnabled } = useConditionalFeature({
    feature: featureShortcutsHub,
    shouldEvaluate: !!user,
  });
  const shortcutsModal =
    user && hubEnabled ? LazyModal.ShortcutsManage : LazyModal.CustomLinks;

  if (!checkIsExtension()) {
    return null;
  }

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
