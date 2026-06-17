import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SidebarAnnouncements } from '@dailydotdev/shared/src/components/sidebar/SidebarAnnouncements';

// Renders the REAL wired container exactly as it mounts in SidebarDesktopV2:
// feature-flag gated (on by default for review), driven by the curated content
// config, with dismissal persisted client-side. Use this to see how it behaves
// in place; use the Playground for a resettable sandbox.
const meta: Meta<typeof SidebarAnnouncements> = {
  title: 'Components/Announcements/In Sidebar',
  component: SidebarAnnouncements,
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
    controls: { disable: true },
  },
};

export default meta;

export const LiveContainer: StoryObj = {
  name: 'Live container (as wired)',
  render: () => (
    <div className="flex min-h-screen items-start gap-10 bg-background-default p-8">
      {/* A slice of the expanded V2 sidebar bottom region. */}
      <div className="flex w-[19rem] flex-col rounded-16 border border-border-subtlest-quaternary bg-background-default p-3">
        <span className="px-1 font-bold text-text-primary typo-footnote">
          What&apos;s new
        </span>
        <SidebarAnnouncements className="mt-2 px-1 pb-1" />
      </div>
      <p className="max-w-sm text-text-secondary typo-callout">
        This is the production container — the same one mounted at the bottom of{' '}
        <code className="rounded-4 bg-surface-float px-1 py-0.5 font-mono typo-caption1">
          SidebarDesktopV2
        </code>
        . It reads the curated <code className="font-mono">SIDEBAR_ANNOUNCEMENTS</code>{' '}
        list and persists dismissals locally, so closing a card here keeps it
        closed on reload (clear site data / IndexedDB to reset).
      </p>
    </div>
  ),
};
