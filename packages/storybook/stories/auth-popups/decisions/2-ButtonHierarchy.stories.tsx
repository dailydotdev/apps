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
  title: 'Auth Pop-ups/5. Still to decide/2. Button hierarchy',
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
      question="Does one sign-in option lead?"
      title="One button hierarchy"
      today={
        <p>
          The landing page makes Google the white primary and the rest
          translucent. The webapp makes every provider white, so nothing leads.
        </p>
      }
      recommendation="Google leads in white. The other options are outlined."
      why={[
        'One clear first choice reads faster than a column of equal buttons.',
        'Google is the most common choice and the one One Tap already promotes, so the page and One Tap point the same way.',
        'It’s what the landing page does today, so both sites match without a redesign there.',
      ]}
      cost="Small. One variant per button in AuthDefault, using the existing secondary style."
      options={[
        {
          label: 'A · All white',
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
          recommended: true,
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
