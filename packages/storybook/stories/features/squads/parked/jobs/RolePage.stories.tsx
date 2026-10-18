import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SquadJobPage } from '../app/features/squads/components/jobs/SquadJobs';
import { jobs, longJob, minimalJob, withApp, withSeed } from '../fixtures';
import { phone, tablet } from '../kit';

// /squads/<handle>/jobs/<id>: a squad sub-page like Products or Members.
// Back arrow and title on top, details in the main column, the squad's
// right column kept. Apply opens the company's own page.

const meta: Meta = {
  title: 'Verified Squads (parked)/3. Jobs/Role page',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
};

export default meta;

type Story = StoryObj;

/** Every field filled in, with more roles under it. */
export const Full: Story = {
  decorators: [withSeed()],
  render: () => <SquadJobPage jobId="job-agents" />,
};

/** Only the required fields: title, location and the apply link. */
export const Minimal: Story = {
  decorators: [withSeed({ extraJobs: [minimalJob] })],
  render: () => <SquadJobPage jobId="job-minimal" />,
};

/** An internship: the employment type shows in the facts. */
export const Internship: Story = {
  decorators: [withSeed()],
  render: () => <SquadJobPage jobId="job-intern" />,
};

/** The longest title, location and five long points. */
export const LongestCopy: Story = {
  decorators: [withSeed({ extraJobs: [longJob] })],
  render: () => <SquadJobPage jobId="job-long" />,
};

/** The only role: no "More roles" section. */
export const OnlyRole: Story = {
  decorators: [withSeed({ jobs: jobs.slice(0, 1) })],
  render: () => <SquadJobPage jobId="job-agents" />,
};

/** Removed, or another squad's role in this address. */
export const NotFound: Story = {
  decorators: [
    withSeed({ failing: [{ id: 'job-gone', kind: 'job', isGone: true }] }),
  ],
  render: () => <SquadJobPage jobId="job-gone" />,
};

/** A network blip: Try again. */
export const FailedToLoad: Story = {
  decorators: [
    withSeed({ failing: [{ id: 'job-blip', kind: 'job', isGone: false }] }),
  ],
  render: () => <SquadJobPage jobId="job-blip" />,
};

export const FullTablet: Story = {
  ...Full,
  name: 'Full · Tablet',
  globals: tablet,
};

export const FullPhone: Story = {
  ...Full,
  name: 'Full · Phone',
  globals: phone,
};
