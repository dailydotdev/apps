import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DecisionPage,
  FooterLink,
  LegalLine,
  MockPopup,
  ProviderList,
} from './mock';

const meta: Meta = {
  title: 'Auth Pop-ups/5. Decisions/2. Button hierarchy',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const footer = <FooterLink text="Already have an account?" link="Log in" />;
const providers = ['google', 'github', 'email'] as const;

export const ButtonHierarchy: StoryObj = {
  name: 'Button hierarchy',
  render: () => (
    <DecisionPage
      number={2}
      decided
      question="Does one sign-in option lead?"
      title="One button hierarchy"
      today={
        <p>
          The landing page makes Google the white primary and the rest
          translucent. The webapp makes every provider white, so nothing leads.
        </p>
      }
      recommendation="Keep today’s pop-up: every provider button is white."
      why={[
        'No provider is favored over another.',
        'Log in still sets its email button apart: it’s the outlined one under the white providers.',
      ]}
      cost="Nothing to build."
      options={[
        {
          label: 'A · All white',
          recommended: true,
          caption: 'Today’s webapp. Nothing leads.',
          mock: (
            <MockPopup title="Sign up" footer={footer}>
              <ProviderList providers={[...providers]} />
              <LegalLine />
            </MockPopup>
          ),
        },
        {
          label: 'B · Google leads',
          caption: 'Like the landing page.',
          mock: (
            <MockPopup title="Sign up" footer={footer}>
              <ProviderList providers={[...providers]} lead="google" />
              <LegalLine />
            </MockPopup>
          ),
        },
        {
          label: 'C · All outlined',
          caption: 'Calm, but the pop-up loses its call to action.',
          mock: (
            <MockPopup title="Sign up" footer={footer}>
              <ProviderList providers={[...providers]} lead="none" />
              <LegalLine />
            </MockPopup>
          ),
        },
      ]}
    />
  ),
};
