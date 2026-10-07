import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SquadPageTab } from '../app/features/squads/lib/routes';
import {
  perksFor,
  sharedPerk,
  Viewer,
  visitorSquad,
  withApp,
  withSeed,
} from '../fixtures';
import { phone, tablet } from '../kit';
import { SquadPage } from '../pages';

// The Perks tab: shop-style cards anyone can see. Locked for visitors,
// unlocked for members, who open a perk to get its code.

const perksOnly = {
  features: { ...visitorSquad.features, jobs: false },
} as Partial<Squad>;

const tenPerks = Array.from({ length: 10 }, (_, i) => ({
  ...perksFor(Viewer.Member)[i % 4],
  id: `perk-${i}`,
}));

const meta: Meta = {
  title: 'Verified Squads (parked)/4. Member perks/Perks tab',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
  render: () => <SquadPage tab={SquadPageTab.Perks} />,
};

export default meta;

type Story = StoryObj;

/** A visitor: every card shows a lock and the line says Join to unlock. */
export const Visitor: Story = {
  decorators: [withSeed()],
};

/** A member: a check instead of the lock. */
export const Member: Story = {
  decorators: [withSeed({ viewer: Viewer.Member })],
};

/** Perks on, jobs off: Posts · Perks. */
export const PerksOnly: Story = {
  decorators: [withSeed({ squadPatch: perksOnly })],
};

/** A single perk. */
export const OnePerk: Story = {
  decorators: [withSeed({ viewer: Viewer.Member, perks: [sharedPerk] })],
};

/** The most Manage allows: 10 perks. */
export const TenPerks: Story = {
  decorators: [withSeed({ viewer: Viewer.Member, perks: tenPerks })],
};

/** No perks, seen by an editor: the tab stays, as a nudge. */
export const EmptyForEditors: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, perks: [] })],
};

export const MemberTablet: Story = {
  ...Member,
  name: 'Member · Tablet',
  globals: tablet,
};

export const MemberPhone: Story = {
  ...Member,
  name: 'Member · Phone',
  globals: phone,
};
