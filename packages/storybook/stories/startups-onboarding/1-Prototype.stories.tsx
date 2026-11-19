import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { bootAsAnonymous } from '../extension/_providers';
import { PhoneFrame } from '../onboarding-fixes/kit';
import { Flow } from './flow';
import { Providers } from './providers';

const meta: Meta = {
  title: 'Startups Onboarding/1. Prototype',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  beforeEach: bootAsAnonymous,
};

export default meta;

/** Click through it. Nothing is saved and nothing is charged. */
export const Desktop: StoryObj = {
  name: 'Click through it',
  render: () => (
    <Providers>
      <Flow />
    </Providers>
  ),
};

export const Phone: StoryObj = {
  name: 'On a phone',
  render: () => (
    <div className="flex min-h-screen justify-center bg-background-default p-6">
      <PhoneFrame
        storyId="startups-onboarding-1-prototype--desktop"
        title="The new onboarding on a phone"
      />
    </div>
  ),
};
