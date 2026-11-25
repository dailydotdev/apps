import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { VerifyStep } from './modal';
import { VerifyBadgeModal } from './modal';
import { Providers } from './providers';
import { knownCompanyHandlers, newCompanyHandlers } from './mocks';

// The one modal all five entry points open: the benefits, then the
// production VerifyExperienceModal as it is today. Type any email and any
// 6-digit code.

type Args = { initialStep: VerifyStep };

const Demo = ({ initialStep }: Args): ReactElement => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Providers>
      <div className="flex min-h-screen items-center justify-center bg-background-default">
        <Button
          variant={ButtonVariant.Secondary}
          onClick={() => setIsOpen(true)}
        >
          Open the modal
        </Button>
        {isOpen && (
          <VerifyBadgeModal
            initialStep={initialStep}
            onRequestClose={() => setIsOpen(false)}
          />
        )}
      </div>
    </Providers>
  );
};

const meta: Meta<Args> = {
  title: 'Verify Work Email/1. Modal',
  component: Demo,
  parameters: { layout: 'fullscreen', msw: { handlers: knownCompanyHandlers } },
  args: { initialStep: 'benefits' },
  argTypes: {
    initialStep: { control: 'select', options: ['benefits', 'form'] },
  },
};

export default meta;
type Story = StoryObj<Args>;

/** New: leads with what the badge gets you, before asking for anything. */
export const Benefits: Story = {};

/**
 * Production, unchanged: VerifyExperienceModal. A known company ends in a
 * "Verification successful" toast.
 */
export const VerifyForm: Story = { args: { initialStep: 'form' } };

/** Production: a company we don't know yet ends in "Verification initiated". */
export const NewCompany: Story = {
  args: { initialStep: 'form' },
  parameters: { msw: { handlers: newCompanyHandlers } },
};
