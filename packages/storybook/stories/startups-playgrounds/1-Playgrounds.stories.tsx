import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { bootAsAnonymous } from '../extension/_providers';
import { Flow, Stage } from '../startups-onboarding/flow';
import { AccountView } from '../startups-onboarding/screens';
import { Providers } from '../startups-onboarding/providers';

// The proposed design, live, once per use case: click anything and go through
// the whole flow. Each starts where that person joins it. People coming from their own squad skip the company step,
// since the page already knows which squad it is. Nothing is saved or charged.

const meta: Meta = {
  title: 'Startups Onboarding/1. Playgrounds',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const NewFounder: Story = {
  name: 'New founder',
  beforeEach: bootAsAnonymous,
  render: () => <Flow />,
};

export const Social: Story = {
  name: 'GitHub or Google',
  beforeEach: bootAsAnonymous,
  render: () => <Flow />,
};

export const Returning: Story = {
  name: 'Returning user',
  beforeEach: bootAsAnonymous,
  render: () => (
    <Flow
      accountView={AccountView.LogIn}
      existing={[
        { name: 'Acme', handle: 'acme', image: '/squad-page/acme-logo.svg' },
      ]}
    />
  ),
};

export const SignedIn: Story = {
  name: 'Signed in, no squad',
  render: () => <Flow start={Stage.Company} />,
};

export const Admin: Story = {
  name: 'Squad admin',
  render: () => (
    <Flow
      start={Stage.Company}
      existing={[
        { name: 'Acme', handle: 'acme', image: '/squad-page/acme-logo.svg' },
        {
          name: 'Acme Labs',
          handle: 'acme_labs',
          image: '/startups-onboarding/acme-labs-logo.svg',
        },
      ]}
    />
  ),
};

export const Upsell: Story = {
  name: 'Squad page upsell',
  render: () => <Flow start={Stage.Upsell} />,
};

export const Manage: Story = {
  name: 'Manage › Subscription',
  render: () => <Flow start={Stage.Manage} />,
};

export const AfterBuying: Story = {
  name: 'After buying',
  render: () => <Flow start={Stage.Setup} />,
};
