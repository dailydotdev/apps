import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { CustomizeNewTabSidebar } from '@dailydotdev/shared/src/features/customizeNewTab/CustomizeNewTabSidebar';
import type { UseCustomizeNewTab } from '@dailydotdev/shared/src/features/customizeNewTab/useCustomizeNewTab';
import { DndContextProvider } from '@dailydotdev/shared/src/contexts/DndContext';
import { ShortcutsProvider } from '@dailydotdev/shared/src/features/shortcuts/contexts/ShortcutsProvider';
import ExtensionProviders from '../../extension/_providers';

const StubbedSidebar = ({
  defaultOpen = true,
  isFirstSession = false,
}: {
  defaultOpen?: boolean;
  isFirstSession?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const customizer: UseCustomizeNewTab = {
    shouldRender: true,
    isOpen,
    isFirstSession,
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

export const FirstSession: Story = {
  args: { defaultOpen: true, isFirstSession: true },
};

export const FirstSessionLight: Story = {
  args: { defaultOpen: true, isFirstSession: true },
  parameters: {
    backgrounds: { default: 'light' },
    theme: 'light',
  },
};

// Showcases the first-run sidebar amplifier beside the welcome hero so
// design can review the full first-run moment in one frame. The real
// KeepItOverlay only activates against `ActionType.SeenKeepItOverlay`,
// which we don't seed in Storybook, so we render static stand-ins for
// the halo, edge beam, and bouncing arrow chip.
export const FirstSessionKeepIt: Story = {
  args: { defaultOpen: true, isFirstSession: true },
  render: (args) => (
    <ExtensionProviders>
      <ShortcutsProvider>
        <DndContextProvider>
          <div className="relative min-h-dvh bg-background-default">
            {/* Halo bloom emanating from the sidebar's left edge. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-30"
              style={{
                right: 'calc(22.5rem - 0.5rem)',
                width: '13.75rem',
                background:
                  'radial-gradient(ellipse 100% 60% at right center, var(--theme-accent-cabbage-default) 0%, var(--theme-accent-bun-default) 24%, transparent 64%)',
                mixBlendMode: 'screen',
                opacity: 0.85,
              }}
            />
            {/* Vertical edge beam pinned to the sidebar's left edge. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-30 w-[3px] overflow-hidden"
              style={{ right: 'calc(22.5rem - 0.0625rem)' }}
            >
              <div className="absolute left-0 top-1/3 h-1/3 w-full bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_1.25rem_0.25rem_rgba(255,255,255,0.65)]" />
            </div>
            {/* Bouncing arrow chip that points INTO the panel. */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-accent-cabbage-default text-white ring-2 ring-white/60 shadow-[0_0_1.25rem_0.25rem_rgba(255,255,255,0.45)]"
              style={{ right: 'calc(22.5rem - 1.125rem)' }}
            >
              →
            </div>
            <StubbedSidebar {...args} />
          </div>
        </DndContextProvider>
      </ShortcutsProvider>
    </ExtensionProviders>
  ),
};
