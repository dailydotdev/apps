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

export const ExtensionSection = (): ReactElement => {
  const { openModal } = useLazyModal();
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { optOutCompanion, toggleOptOutCompanion } = useSettingsContext();

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
            onClick: () => openModal({ type: LazyModal.CustomLinks }),
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
