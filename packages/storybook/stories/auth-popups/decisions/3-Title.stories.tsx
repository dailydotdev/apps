import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Capture } from '../kit';
import {
  DecisionPage,
  FooterLink,
  LegalLine,
  MockPopup,
  ProviderList,
} from './mock';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Decisions/3. Title',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const footer = <FooterLink text="Already have an account?" link="Log in" />;
const providers = ['google', 'github', 'email'] as const;

export const Title: StoryObj = {
  name: 'Title',
  render: () => (
    <DecisionPage
      number={3}
      decided
      question="How does the pop-up name itself?"
      title="One title"
      today={
        <p>
          The landing pop-up opens on a marketing headline. The webapp pop-up
          has a 17px “Sign up” header bar. The full page has a centered 24px
          title.
        </p>
      }
      recommendation="The header bar, with the landing page’s headline under it on Sign up. Full pages keep their centered title."
      why={[
        'The bar keeps the close button and a back arrow in the same row on every step.',
        'The headline carries the landing page’s voice into the app, so a visitor from daily.dev sees the same promise in both pop-ups.',
        'Only Sign up gets it: Log in and Welcome back are for people who already have an account.',
      ]}
      cost="Built in this PR for the webapp (AuthDefault). The landing PR swaps its headline-only top for the same bar plus headline."
      options={[
        {
          label: 'Today · landing headline',
          caption: 'daily.dev, production.',
          mock: (
            <Capture name="landing-modal-phone" alt="Landing page pop-up" />
          ),
        },
        {
          label: 'A + B · Header bar and headline',
          recommended: true,
          caption: 'Decided, and built in this PR.',
          mock: (
            <MockPopup title="Sign up" footer={footer}>
              <p className="mb-3 text-center font-bold typo-title2">
                Where developers discover what’s next.
              </p>
              <ProviderList providers={[...providers]} lead="google" />
              <LegalLine />
            </MockPopup>
          ),
        },
        {
          label: 'A · Header bar',
          caption: 'The bar alone.',
          mock: (
            <MockPopup title="Sign up" footer={footer}>
              <ProviderList providers={[...providers]} lead="google" />
              <LegalLine />
            </MockPopup>
          ),
        },
        {
          label: 'B · Headline in the content',
          caption: 'Close button only, the title as a headline.',
          mock: (
            <MockPopup title="" footer={footer}>
              <h2 className="py-4 text-center font-bold typo-title1">
                Where developers discover what’s next.
              </h2>
              <ProviderList providers={[...providers]} lead="google" />
              <LegalLine />
            </MockPopup>
          ),
        },
      ]}
    />
  ),
};
