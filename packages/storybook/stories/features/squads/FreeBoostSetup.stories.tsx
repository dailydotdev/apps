import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { FreeBoostSetupStep } from '@dailydotdev/shared/src/features/squads/components/freeBoost/FreeBoostCard';
import { FreeBoostCard } from '@dailydotdev/shared/src/features/squads/components/freeBoost/FreeBoostCard';
import ExtensionProviders from '../../extension/_providers';

// The free boost card while the company page is missing what the boost
// needs (logo, website, description).

const steps = (
  done: Partial<Record<string, boolean>>,
): FreeBoostSetupStep[] => [
  {
    id: 'logo',
    title: 'Logo',
    hint: 'Shows next to your boosted post.',
    isDone: !!done.logo,
    href: '#',
    cta: 'Add logo',
  },
  {
    id: 'website',
    title: 'Website',
    hint: 'Where developers go after reading your post.',
    isDone: !!done.website,
    href: '#',
    cta: 'Add website',
  },
  {
    id: 'description',
    title: 'Description',
    hint: "What you build and who it's for, in a sentence or two.",
    isDone: !!done.description,
    href: '#',
    cta: 'Write it',
  },
];

const meta: Meta<typeof FreeBoostCard> = {
  title: 'Features/Squads/Free boost setup',
  component: FreeBoostCard,
  parameters: { layout: 'padded' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="mx-auto max-w-[40rem] bg-background-default p-4">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof FreeBoostCard>;

export const NothingYet: Story = {
  name: '1. Page missing everything',
  args: { state: 'setup', steps: steps({}) },
};

export const MissingWebsite: Story = {
  name: '2. Page missing its website',
  args: { state: 'setup', steps: steps({ logo: true, description: true }) },
};

export const Phone: Story = {
  ...NothingYet,
  name: '3. Phone',
  globals: { theme: 'dark', viewport: { value: 'mobile2', isRotated: false } },
};
