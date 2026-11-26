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
import {
  emailRejectedHandlers,
  pendingReviewHandlers,
  verifyHandlers,
  wrongCodeHandlers,
} from './mocks';

// The one modal all five entry points open: the benefits, then the
// production VerifyExperienceModal as it is today. Type any email and any
// 6-digit code. The error stories answer with an error, and production shows
// its generic error toast.

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
  parameters: { layout: 'fullscreen', msw: { handlers: verifyHandlers } },
  args: { initialStep: 'benefits' },
  argTypes: {
    initialStep: { control: 'select', options: ['benefits', 'form'] },
  },
};

export default meta;
type Story = StoryObj<Args>;

const phone = { viewport: { value: 'mobile1', isRotated: false } };

/** New: leads with what the badge gets you, before asking for anything. */
export const Benefits: Story = {};

/** On a phone the modal opens as a bottom sheet, as every shared modal does. */
export const BenefitsOnPhone: Story = { globals: phone };

/**
 * Production, unchanged: VerifyExperienceModal. It ends in a "Verification
 * successful" toast.
 */
export const VerifyForm: Story = { args: { initialStep: 'form' } };

export const VerifyFormOnPhone: Story = {
  args: { initialStep: 'form' },
  globals: phone,
};

/** The email is refused (a personal address, say): the generic error toast. */
export const EmailRejected: Story = {
  args: { initialStep: 'form' },
  parameters: { msw: { handlers: emailRejectedHandlers } },
};

/** The code is wrong or expired: the generic error toast. */
export const WrongCode: Story = {
  args: { initialStep: 'form' },
  parameters: { msw: { handlers: wrongCodeHandlers } },
};

/**
 * A company we don't have yet: production toasts "Verification initiated"
 * while the team reviews it.
 */
export const PendingReview: Story = {
  args: { initialStep: 'form' },
  parameters: { msw: { handlers: pendingReviewHandlers } },
};
