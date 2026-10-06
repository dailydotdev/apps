import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import {
  SquadManageJobForm,
  SquadManageJobs,
} from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageJobsPerks';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { fullBoard, Viewer, withApp, withSeed } from '../fixtures';
import { phone, tablet } from '../kit';
import { ManagePage } from '../pages';

// Manage › Jobs, built exactly like Manage › Products: a list with Add in
// the header, rows that reorder and edit, and a form page per role.

const admin = withSeed({ viewer: Viewer.Admin });

const List = () => (
  <ManagePage section={SquadManageSection.Jobs}>
    <SquadManageJobs />
  </ManagePage>
);

const Form = ({ jobId }: { jobId?: string }) => (
  <ManagePage section={SquadManageSection.Jobs}>
    <SquadManageJobForm jobId={jobId} />
  </ManagePage>
);

const meta: Meta = {
  title: 'Verified Squads (parked)/3. Jobs/Manage page',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
};

export default meta;

type Story = StoryObj;

/** The list: reorder with the arrows, edit with the pencil. */
export const Roles: Story = {
  decorators: [admin],
  render: () => <List />,
};

/** No roles yet: the Jobs tab stays hidden from members until one is added. */
export const NoRoles: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, jobs: [] })],
  render: () => <List />,
};

/** At the limit of 20: Add is gone. */
export const AtTheLimit: Story = {
  decorators: [withSeed({ viewer: Viewer.Admin, jobs: fullBoard })],
  render: () => <List />,
};

/** A new role: Onsite and Full-time preselected. */
export const AddRole: Story = {
  decorators: [admin],
  render: () => <Form />,
};

/** Editing a role, with Remove at the bottom. */
export const EditRole: Story = {
  decorators: [admin],
  render: () => <Form jobId="job-agents" />,
};

/**
 * Save with a link the API would refuse: the link field says why. Empty
 * required fields do not turn red (the shared TextField never marks an
 * empty field), see the spec.
 */
export const InvalidApplyLink: Story = {
  decorators: [admin],
  render: () => <Form />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Add role');
    const field = (name: string) =>
      canvasElement.querySelector(`[name="${name}"]`) as HTMLInputElement;
    await userEvent.type(field('title'), 'Solutions Engineer');
    await userEvent.type(field('location'), 'New York');
    await userEvent.type(field('applyUrl'), 'coderabbit.ai/careers');
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    field('applyUrl')?.scrollIntoView({ block: 'center' });
  },
};

/** An address for a role that is gone. */
export const RoleNotFound: Story = {
  decorators: [admin],
  render: () => <Form jobId="job-gone" />,
};

export const RolesTablet: Story = {
  ...Roles,
  name: 'Roles · Tablet',
  globals: tablet,
};

export const RolesPhone: Story = {
  ...Roles,
  name: 'Roles · Phone',
  globals: phone,
};

export const EditRolePhone: Story = {
  ...EditRole,
  name: 'Edit role · Phone',
  globals: phone,
};
