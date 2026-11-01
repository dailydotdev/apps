import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture } from '../kit';
import {
  DecisionPage,
  FooterLink,
  LegalLine,
  MockPhone,
  MockPopup,
  ProviderList,
} from './mock';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Decisions/6. Phone layout',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const footer = <FooterLink text="Already have an account?" link="Log in" />;
const providers = ['google', 'github', 'email'] as const;

export const PhoneLayout: StoryObj = {
  name: 'Phone layout',
  render: () => (
    <DecisionPage
      number={6}
      decided
      question="How does the pop-up sit on a phone?"
      title="The landing card and the phone layout"
      today={
        <p>
          The webapp pop-up takes the whole phone screen. The landing pop-up is
          a 464px card over a blurred page, and on desktop it’s #17171C instead
          of the primary background.
        </p>
      }
      recommendation="Keep today’s layouts for now. The landing pop-up stays a card on phones, and the webapp stays full screen. Full screen for the landing is a later call."
      why={[
        'Nothing changes on phones in this round, on either site.',
        'The webapp stays full screen because its later steps have fields and a pinned footer and action bar that need a fixed bottom edge.',
        'Still open for the landing PR: matching the webapp’s 400px width and primary background on desktop.',
      ]}
      cost="None now. Revisit the landing’s phone layout later."
      options={[
        {
          label: 'Today · landing card',
          recommended: true,
          caption: 'Decided for the landing page: stays a card on phones.',
          mock: (
            <Capture
              name="landing-modal-phone"
              alt="Landing pop-up on a phone"
            />
          ),
        },
        {
          label: 'A · Full screen',
          recommended: true,
          caption: 'Decided for the webapp: unchanged.',
          mock: (
            <MockPhone>
              <MockPopup title="Sign up" footer={footer}>
                <ProviderList providers={[...providers]} lead="google" />
                <LegalLine />
              </MockPopup>
            </MockPhone>
          ),
        },
        {
          label: 'B · Bottom sheet',
          caption: 'The page stays visible above it.',
          mock: (
            <MockPhone sheet>
              <MockPopup title="Sign up" footer={footer} sheet>
                <ProviderList providers={[...providers]} lead="google" />
                <LegalLine />
              </MockPopup>
            </MockPhone>
          ),
        },
      ]}
    />
  ),
};
