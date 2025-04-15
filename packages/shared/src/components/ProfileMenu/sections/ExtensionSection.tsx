import React from 'react';
import type { ReactElement } from 'react';

import { HorizontalSeparator } from '../../utilities';
import { ProfileSection } from '../ProfileSection';
import { useDndContext } from '../../../contexts/DndContext';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { PauseIcon, PlayIcon, StoryIcon } from '../../icons';

export const ExtensionSection = (): ReactElement => {
  const { isActive: isDndActive, setShowDnd } = useDndContext();
  const { optOutCompanion, toggleOptOutCompanion } = useSettingsContext();

  return (
    <>
      <HorizontalSeparator />

      <ProfileSection
        items={[
          // TODO: Implement new shortcuts popover
          // {
          //   title: 'Shortcuts',
          //   icon: <ShortcutsIcon />,
          //   onClick: () => {},
          // },
          {
            title: `${isDndActive ? 'Resume' : 'Pause'} new tab`,
            icon: isDndActive ? <PlayIcon /> : <PauseIcon />,
            onClick: () => setShowDnd?.(true),
          },
          {
            title: `${optOutCompanion ? 'Enable' : 'Disable'} companion widget`,
            icon: <StoryIcon secondary={!optOutCompanion} />,
            onClick: () => toggleOptOutCompanion(),
          },
        ]}
      />
    </>
  );
};
