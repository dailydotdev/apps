import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerifyBadgeModal } from './modal';
import { Labeled, Page } from './kit';
import { entryPoints } from './entryPoints';
import type { JobState } from './providers';
import { jobStates, Providers } from './providers';
import { verifyHandlers } from './mocks';

const EntryPointsPage = ({
  only,
  jobState = 'known',
}: {
  only?: string;
  /** The member's current job: drives the logo, the copy and whether we ask. */
  jobState?: JobState;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const shown = only
    ? entryPoints.filter(({ id }) => id === only)
    : entryPoints;

  return (
    <Providers jobState={jobState}>
      <Page
        eyebrow="Verify work email · proposal"
        title="Five places to ask, one modal"
        intro="We ask only after someone tells us where they work. Each place is drawn by the production components that render it today, with the new ask where it would go. Click any ask to open the modal."
      >
        <div className="flex flex-col gap-12">
          {shown.map(({ id, title, where, status, Surface }) => (
            <Labeled key={id} status={status} title={title} where={where}>
              <Surface onVerify={() => setIsOpen(true)} />
            </Labeled>
          ))}
        </div>
        {isOpen && <VerifyBadgeModal onRequestClose={() => setIsOpen(false)} />}
      </Page>
    </Providers>
  );
};

const meta: Meta<typeof EntryPointsPage> = {
  title: 'Verify Work Email/2. Entry points',
  component: EntryPointsPage,
  parameters: { layout: 'fullscreen', msw: { handlers: verifyHandlers } },
  args: { jobState: 'known' },
  argTypes: {
    jobState: {
      name: 'Member’s current job',
      control: { type: 'select', labels: jobStates },
      options: Object.keys(jobStates),
    },
    only: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof EntryPointsPage>;

export const AllFive: Story = {};

export const AfterSavingAJob: Story = { args: { only: 'after-saving-job' } };

export const UnverifiedJob: Story = { args: { only: 'unverified-job-row' } };

export const ProfileHeader: Story = { args: { only: 'profile-header-chip' } };

export const AfterCVUpload: Story = { args: { only: 'after-cv-upload' } };

export const SomeoneElsesBadge: Story = { args: { only: 'others-badge' } };

const phone = { viewport: { value: 'mobile1', isRotated: false } };
const tablet = { viewport: { value: 'tablet', isRotated: false } };

/** All five on a phone. */
export const AllFiveOnPhone: Story = { globals: phone };

/** All five on a tablet, where settings shows its own menu. */
export const AllFiveOnTablet: Story = { globals: tablet };

/** While the job loads, each ask holds its place with a skeleton. */
export const Loading: Story = { args: { jobState: 'loading' } };

/** No current job: nothing to verify, so no ask anywhere. */
export const NoCurrentJob: Story = { args: { jobState: 'none' } };

/**
 * Already verified: the asks are gone, and someone else's badge keeps
 * today's behaviour.
 */
export const AlreadyVerified: Story = { args: { jobState: 'verified' } };

/** A long typed-in company name wraps without pushing the button out. */
export const LongCompanyName: Story = { args: { jobState: 'long' } };
