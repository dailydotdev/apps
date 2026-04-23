import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { CustomizeNewTabSidebar } from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabSidebar';
import type { UseCustomizeNewTab } from '@dailydotdev/shared/src/features/customizeNewTab/useCustomizeNewTab';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { ShortcutsProvider } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import ExtensionProviders from '../../extension/_providers';

const StubbedSidebar = ({ defaultOpen = true }: { defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const customizer: UseCustomizeNewTab = {
    shouldRender: true,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
  return <CustomizeNewTabSidebar customizer={customizer} />;
};

const meta: Meta<typeof StubbedSidebar> = {
  title: 'Features/CustomizeNewTab/Sidebar',
  component: StubbedSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  render: (args) => (
    <ExtensionProviders>
      <ShortcutsProvider>
        <DndContextProvider>
          <div className="min-h-dvh bg-background-default">
            <StubbedSidebar {...args} />
          </div>
        </DndContextProvider>
      </ShortcutsProvider>
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof StubbedSidebar>;

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Collapsed: Story = {
  args: { defaultOpen: false },
};

export const Light: Story = {
  args: { defaultOpen: true },
  parameters: {
    backgrounds: { default: 'light' },
    theme: 'light',
  },
};
