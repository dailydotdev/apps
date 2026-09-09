import React, { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SettingsContextData } from '@dailydotdev/shared/src/contexts/SettingsContext';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import type { LogContextData } from '@dailydotdev/shared/src/hooks/log/useLogContextData';
import { SidebarDensitySection } from '@dailydotdev/shared/src/components/ProfileMenu/sections/SidebarDensitySection';
import type { SettingsFlags } from '@dailydotdev/shared/src/graphql/settings';

// The two rail thumbnails are the whole point, so the story keeps the flag in
// local state and lets you click between them.
const SettingsHarness = () => {
  const [flags, setFlags] = useState<SettingsFlags>({} as SettingsFlags);
  const settings = useMemo(
    () =>
      ({
        flags,
        updateFlag: async (flag: keyof SettingsFlags, value: unknown) =>
          setFlags((current) => ({ ...current, [flag]: value })),
      } as unknown as SettingsContextData),
    [flags],
  );

  const LogContext = getLogContextStatic();

  return (
    <LogContext.Provider
      value={{ logEvent: () => undefined } as unknown as LogContextData}
    >
      <SettingsContext.Provider value={settings}>
        <div className="max-w-lg bg-background-default p-6">
          <SidebarDensitySection />
        </div>
      </SettingsContext.Provider>
    </LogContext.Provider>
  );
};

const meta: Meta = {
  title: 'Components/Sidebar/Density section',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <SettingsHarness /> };
