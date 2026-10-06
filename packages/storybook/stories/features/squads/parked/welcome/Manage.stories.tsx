import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { emptySquadWelcome } from '@dailydotdev/shared/src/graphql/squadWelcomeAudience';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageWelcome } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageWelcome';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { Viewer, welcome, withApp, withSeed } from '../fixtures';
import { phone, tablet } from '../kit';

// Manage › Welcome pop-up, under Community: the fields on the left and a
// live preview on the right (stacked below laptop L).

const render = () => (
  <SquadManageLayout section={SquadManageSection.Welcome}>
    <SquadManageWelcome />
  </SquadManageLayout>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/1. Welcome pop-up/Manage page',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
  render,
};

export default meta;

type Story = StoryObj;

/** Set up and on: the default example with the house rules. */
export const Filled: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
};

/** Never set up: off, empty fields, the preview shows the defaults. */
export const FirstVisit: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, welcome: emptySquadWelcome })],
};

/** Switched off: the preview dims, nothing opens after Join. */
export const SwitchedOff: Story = {
  decorators: [
    withSeed({ viewer: Viewer.Admin, welcome: { ...welcome, enabled: false } }),
  ],
};

/** No rules in Manage › Rules: the rules switch is off and disabled. */
export const NoHouseRules: Story = {
  decorators: [
    withSeed({
      viewer: Viewer.Admin,
      squadPatch: { rules: [] },
      welcome: { ...welcome, showRules: false },
    }),
  ],
};

/** A link the API would refuse: no real domain, so the field says so. */
export const InvalidLink: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin })],
  play: async ({ canvasElement }) => {
    // The form renders once the saved pop-up is read
    await within(canvasElement).findAllByText(
      'Show a pop-up when someone joins',
    );
    const field = canvasElement.querySelector<HTMLInputElement>(
      'input[name="ctaUrl"]',
    );
    if (!field) {
      return;
    }
    await userEvent.clear(field);
    await userEvent.type(field, 'https://localhost:3000');
  },
};

export const FilledTablet: Story = {
  ...Filled,
  name: 'Filled · Tablet',
  globals: tablet,
};

export const FilledPhone: Story = {
  ...Filled,
  name: 'Filled · Phone',
  globals: phone,
};
