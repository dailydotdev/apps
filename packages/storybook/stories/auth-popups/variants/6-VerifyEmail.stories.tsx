import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Labeled,
  LiveFrame,
  PHONE,
  PhoneRow,
  screen,
  Section,
  Variant,
} from '../kit';
import { closeRow } from '../changes';

const meta: Meta = {
  title: 'Auth Pop-ups/1. Variants/6. Verify email',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const VerifyEmail: StoryObj = {
  name: 'Verify email',
  render: () => (
    <Variant
      number={6}
      question="After email sign-up, or logging in unverified"
      title="Verify email"
      goal={
        <p>
          The 6-digit code screen. It now works like the onboarding’s verify
          step: no back arrow, a “Wrong email? Change email” link instead, and
          the mail icon above the message.
        </p>
      }
      missing="No production capture: reaching this screen takes a real sign-up. Before, the header had a back arrow (two on phones), the mail icon sat above the header, and Verify ran edge to edge on phones."
      story={screen('verify-email')}
      changes={[
        {
          ...closeRow,
          cells: [
            'Two back arrows on phones, a back arrow and a close button on desktop',
            'Only the close button, on the right. “Wrong email? Change email” goes back, like the onboarding.',
          ],
        },
        {
          aspect: 'Mail icon',
          cells: [
            'Above the header bar, outside the content',
            'Under the header, above “We sent a 6-digit code”',
          ],
        },
        {
          aspect: 'Verify button',
          cells: [
            '40px tall. Edge to edge on phones narrower than 420px, 56px in on desktop.',
            'Full width and 48px tall, 24px in at every size',
          ],
        },
      ]}
    >
      <Section
        title="Onboarding, for reference"
        note="The verify step the pop-up now follows."
      >
        <PhoneRow>
          <Labeled label="Onboarding · production code" tone="neutral">
            <LiveFrame
              storyId="onboarding-fixes-2-verify-email-header--verify&globals=theme:dark"
              title="Onboarding verify step on a phone"
              {...PHONE}
            />
          </Labeled>
        </PhoneRow>
      </Section>
    </Variant>
  ),
};
