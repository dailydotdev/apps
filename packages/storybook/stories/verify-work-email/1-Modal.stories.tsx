import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { VerifyStep } from './modal';
import { VerifyBadgeModal } from './modal';

// The one modal all five entry points open. Each story starts on a step and
// the buttons walk the rest of the flow. Copy is a placeholder.

type Args = { initialStep: VerifyStep; isKnownCompany: boolean };

const Demo = ({ initialStep, isKnownCompany }: Args): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-default">
      <Button variant={ButtonVariant.Secondary} onClick={() => setIsOpen(true)}>
        Open the modal
      </Button>
      {isOpen && (
        <VerifyBadgeModal
          key={initialStep}
          initialStep={initialStep}
          isKnownCompany={isKnownCompany}
          onRequestClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const meta: Meta<Args> = {
  title: 'Verify Work Email/1. Modal',
  component: Demo,
  parameters: { layout: 'fullscreen' },
  args: { initialStep: 'benefits', isKnownCompany: true },
  argTypes: {
    initialStep: {
      control: 'select',
      options: ['benefits', 'email', 'code', 'verified', 'pending'],
    },
    isKnownCompany: {
      name: 'Company already registered',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<Args>;

/** Leads with what the badge gets you, before asking for anything. */
export const Benefits: Story = {};

export const WorkEmail: Story = { args: { initialStep: 'email' } };

/** Type any 6 digits to continue. */
export const Code: Story = { args: { initialStep: 'code' } };

/** Replaces the job of campaign 27's "Successful verification" popover. */
export const Verified: Story = { args: { initialStep: 'verified' } };

/** A company we don't know yet: same message the current modal gives. */
export const PendingReview: Story = { args: { initialStep: 'pending' } };
