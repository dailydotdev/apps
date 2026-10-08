import React from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import HijackingLoginStrip from 'extension/src/newtab/HijackingLoginStrip';
import ExtensionProviders, { bootAsAnonymous } from './_providers';

const Strip = (): ReactElement => (
  <ExtensionProviders>
    <div className="dark min-h-dvh bg-background-default p-6">
      <div className="mx-auto max-w-[60rem]">
        <HijackingLoginStrip />
      </div>
    </div>
  </ExtensionProviders>
);

const meta: Meta<typeof Strip> = {
  title: 'Extension/HijackingStrip',
  component: Strip,
  beforeEach: bootAsAnonymous,
  parameters: {
    layout: 'fullscreen',
    themes: { themeOverride: 'dark' },
  },
};

export default meta;

type Story = StoryObj<typeof Strip>;

export const Default: Story = {};
