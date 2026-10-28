import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  SquadManagePerkForm,
  SquadManagePerks,
} from '../app/features/squads/components/manage/SquadManageJobsPerks';
import { SquadManageSection } from '../app/features/squads/lib/routes';
import { perksFor, Viewer, withApp, withSeed } from '../fixtures';
import { phone, tablet } from '../kit';
import { ManagePage } from '../pages';

// Manage › Member perks, built like Manage › Products. Editors also see
// perks that ended, and how many unique codes are left.

const admin = withSeed({ viewer: Viewer.Admin });

const tenPerks = Array.from({ length: 10 }, (_, i) => ({
  ...perksFor(Viewer.Admin)[i % 5],
  id: `perk-${i}`,
}));

const List = () => (
  <ManagePage section={SquadManageSection.Perks}>
    <SquadManagePerks />
  </ManagePage>
);

const Form = ({ perkId }: { perkId?: string }) => (
  <ManagePage section={SquadManageSection.Perks}>
    <SquadManagePerkForm perkId={perkId} />
  </ManagePage>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/4. Member perks/Manage page',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
};

export default meta;

type Story = StoryObj;

/** The list, with codes left on unique-code perks and the ended one. */
export const Perks: Story = {
  decorators: [admin],
  render: () => <List />,
};

/** No perks yet. */
export const NoPerks: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, perks: [] })],
  render: () => <List />,
};

/** At the limit of 10: Add is gone. */
export const AtTheLimit: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, perks: tenPerks })],
  render: () => <List />,
};

/** A new perk: one shared code by default. */
export const AddPerk: Story = {
  decorators: [admin],
  render: () => <Form />,
};

/** Editing a shared-code perk. */
export const EditSharedCode: Story = {
  decorators: [admin],
  render: () => <Form perkId="perk-pro" />,
};

/** Editing a unique-code perk: paste or upload codes, see how many are left. */
export const EditUniqueCodes: Story = {
  decorators: [admin],
  render: () => <Form perkId="perk-agents" />,
};

/** An address for a perk that is gone. */
export const PerkNotFound: Story = {
  decorators: [admin],
  render: () => <Form perkId="perk-gone" />,
};

export const PerksTablet: Story = {
  ...Perks,
  name: 'Perks · Tablet',
  globals: tablet,
};

export const PerksPhone: Story = {
  ...Perks,
  name: 'Perks · Phone',
  globals: phone,
};

export const EditUniqueCodesPhone: Story = {
  ...EditUniqueCodes,
  name: 'Edit unique codes · Phone',
  globals: phone,
};
