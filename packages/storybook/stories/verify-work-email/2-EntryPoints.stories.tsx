import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VerifyBadgeModal } from './modal';
import { Labeled, Page } from './kit';
import { entryPoints } from './entryPoints';
import { Providers } from './providers';
import { verifyHandlers } from './mocks';

const EntryPointsPage = ({ only }: { only?: string }): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const shown = only
    ? entryPoints.filter(({ id }) => id === only)
    : entryPoints;

  return (
    <Providers>
      <Page
        eyebrow="Verify work email · proposal"
        title="Five places to ask, one modal"
        intro="We ask only after someone tells us where they work. Each place is drawn by the production components that render it today; the new ask is in a dashed New box. Click any ask to open the modal."
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
};

export default meta;
type Story = StoryObj<typeof EntryPointsPage>;

export const AllFive: Story = {};

export const AfterSavingAJob: Story = { args: { only: 'after-saving-job' } };

export const UnverifiedJob: Story = { args: { only: 'unverified-job-row' } };

export const ProfileHeader: Story = { args: { only: 'profile-header-chip' } };

export const AfterCVUpload: Story = { args: { only: 'after-cv-upload' } };

export const SomeoneElsesBadge: Story = { args: { only: 'others-badge' } };
