import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SquadPageTab } from '../app/features/squads/lib/routes';
import {
  fullBoard,
  jobs,
  longJob,
  Viewer,
  visitorSquad,
  withApp,
  withSeed,
} from '../fixtures';
import { phone, tablet } from '../kit';
import { SquadPage } from '../pages';

// The squad page with Posts · Jobs · Perks. From laptop the tabs sit over
// the feed; below laptop they join the Posts and About tabs.

const jobsOnly = {
  features: { ...visitorSquad.features, perks: false },
} as Partial<Squad>;

const meta: Meta = {
  title: 'Verified Squads (parked)/3. Jobs/Jobs tab',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
  render: () => <SquadPage tab={SquadPageTab.Jobs} />,
};

export default meta;

type Story = StoryObj;

/** The public board: anyone can browse it, signed in or not. */
export const Board: Story = {
  decorators: [withSeed()],
};

/** Where the tabs sit when the page opens on Posts. */
export const TabsOnPosts: Story = {
  decorators: [withSeed()],
  render: () => <SquadPage tab={SquadPageTab.Posts} />,
};

/** Jobs on, perks off: Posts · Jobs. */
export const JobsOnly: Story = {
  decorators: [withSeed({ squadPatch: jobsOnly })],
};

/** A single role. */
export const OneRole: Story = {
  decorators: [withSeed({ jobs: jobs.slice(0, 1) })],
};

/** The most Manage allows: 20 roles. */
export const TwentyRoles: Story = {
  decorators: [withSeed({ jobs: fullBoard })],
};

/** The longest title and location, to check wrapping. */
export const LongTitle: Story = {
  decorators: [withSeed({ jobs: [longJob, ...jobs.slice(0, 2)] })],
};

/** No roles, seen by an editor: the tab stays, as a nudge. */
export const EmptyForEditors: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, jobs: [] })],
};

/** No roles, seen by anyone else: there is no Jobs tab. */
export const EmptyForVisitors: Story = {
  decorators: [withSeed({ jobs: [] })],
  render: () => <SquadPage tab={SquadPageTab.Posts} />,
};

export const BoardTablet: Story = {
  ...Board,
  name: 'Board · Tablet',
  globals: tablet,
};

export const BoardPhone: Story = {
  ...Board,
  name: 'Board · Phone',
  globals: phone,
};
