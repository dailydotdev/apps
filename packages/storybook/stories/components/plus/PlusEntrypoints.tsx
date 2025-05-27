import React, { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PlusEntrypoint } from '@dailydotdev/shared/src/features/plus/components/PlusEntripoint/PlusEntrypoint';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { fn } from '@storybook/test';
import { TargetId } from '@dailydotdev/shared/src/lib/log';
import ExtensionProviders from '../../extension/_providers';

const meta: Meta<typeof PlusEntrypoint> = {
  title: 'Components/Plus/PlusEntrypoint',
  component: PlusEntrypoint,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  tags: ['autodocs'],
  render: (args) => (
    <ExtensionProviders>
      <PlusEntrypoint {...args} />
    </ExtensionProviders>
  ),
};

export default meta;

type Story = StoryObj<typeof PlusEntrypoint>;

export const WithCloseButton: Story = {
  args: {
    cta: {
      label: 'Upgrade to Plus',
    },
    close: {
      behavior: 'closeButton',
    },
    target: TargetId.On,
    children: (
      <div className="p-4 bg-theme-float rounded-16 text-center">
        <h3 className="font-bold text-lg mb-2">Unlock Premium Features</h3>
        <p>Get access to exclusive features with daily.dev Plus</p>
      </div>
    ),
  },
};

export const WithCloseCTA: Story = {
  args: {
    cta: {
      label: 'Get Plus',
    },
    close: {
      behavior: 'cta',
    },
    target: TargetId.On,
    children: (
      <div className="p-4 bg-theme-float rounded-16 text-center">
        <h3 className="font-bold text-lg mb-2">Upgrade Your Experience</h3>
        <p>Enhance your daily.dev with premium features</p>
      </div>
    ),
  },
};

export const DifferentCTALabel: Story = {
  args: {
    cta: {
      label: 'Try Plus Now',
    },
    close: {
      behavior: 'closeButton',
    },
    target: TargetId.On,
    children: (
      <div className="p-4 bg-theme-float rounded-16 text-center">
        <h3 className="font-bold text-lg mb-2">Special Offer</h3>
        <p>Limited time discount on daily.dev Plus</p>
      </div>
    ),
  },
};
