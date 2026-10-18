import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquadPerkPage } from '../app/features/squads/components/perks/SquadPerks';
import {
  claimedUniquePerk,
  endedPerk,
  perksFor,
  Viewer,
  withApp,
  withSeed,
} from '../fixtures';
import { phone, tablet } from '../kit';

// /squads/<handle>/perks/<id>: a squad sub-page like Products or Members.
// Visitors are asked to join; members get the code, Copy and Redeem.

const withClaimed = perksFor(Viewer.Member).map((item) =>
  item.id === claimedUniquePerk.id ? claimedUniquePerk : item,
);

const meta: Meta = {
  title: 'Verified Squads (parked)/4. Member perks/Perk page',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
};

export default meta;

type Story = StoryObj;

/** A visitor: Join <squad> to unlock. Joining asks for the perk again. */
export const Visitor: Story = {
  decorators: [withSeed()],
  render: () => <SquadPerkPage perkId="perk-pro" />,
};

/** A member, shared code: the code, Copy and Redeem. Copy counts the claim. */
export const SharedCode: Story = {
  decorators: [withSeed({ viewer: Viewer.Member })],
  render: () => <SquadPerkPage perkId="perk-pro" />,
};

/** A member, unique codes, not taken yet: Get your code. */
export const UniqueCode: Story = {
  decorators: [withSeed({ viewer: Viewer.Member })],
  render: () => <SquadPerkPage perkId="perk-agents" />,
};

/** A member who took a unique code: their own code, every time. */
export const UniqueCodeTaken: Story = {
  decorators: [withSeed({ viewer: Viewer.Member, perks: withClaimed })],
  render: () => <SquadPerkPage perkId="perk-agents" />,
};

/** Every code taken. */
export const SoldOut: Story = {
  decorators: [withSeed({ viewer: Viewer.Member })],
  render: () => <SquadPerkPage perkId="perk-sold-out" />,
};

/** Past its end date, opened from an old link. */
export const Ended: Story = {
  decorators: [withSeed({ viewer: Viewer.Member, extraPerks: [endedPerk] })],
  render: () => <SquadPerkPage perkId="perk-ended" />,
};

/** Only the required fields: no description, steps, fine print or link. */
export const Minimal: Story = {
  decorators: [withSeed({ viewer: Viewer.Member })],
  render: () => <SquadPerkPage perkId="perk-minimal" />,
};

/** Removed, or another squad's perk in this address. */
export const NotFound: Story = {
  decorators: [
    withSeed({
      viewer: Viewer.Member,
      failing: [{ id: 'perk-gone', kind: 'perk', isGone: true }],
    }),
  ],
  render: () => <SquadPerkPage perkId="perk-gone" />,
};

/** A network blip: Try again. */
export const FailedToLoad: Story = {
  decorators: [
    withSeed({
      viewer: Viewer.Member,
      failing: [{ id: 'perk-blip', kind: 'perk', isGone: false }],
    }),
  ],
  render: () => <SquadPerkPage perkId="perk-blip" />,
};

export const SharedCodeTablet: Story = {
  ...SharedCode,
  name: 'Shared code · Tablet',
  globals: tablet,
};

export const SharedCodePhone: Story = {
  ...SharedCode,
  name: 'Shared code · Phone',
  globals: phone,
};

export const VisitorPhone: Story = {
  ...Visitor,
  name: 'Visitor · Phone',
  globals: phone,
};
