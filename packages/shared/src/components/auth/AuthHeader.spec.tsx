import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthHeader from './AuthHeader';
import { onboardingHeadlineClasses } from '../onboarding/common';

// `onboardingHeadline` exists so the two screens that sit in FRONT of the
// onboarding funnel (account details, verify email) can take the funnel's
// headline scale. It is deliberately separate from `simplified`, which eleven
// other surfaces set — including the paid /helloworld funnel and the recruiter
// sign-in modals — so these assert both directions.
describe('AuthHeader', () => {
  it('takes the funnel headline scale when onboardingHeadline is set', () => {
    render(
      <AuthHeader simplified onboardingHeadline title="Verify your email" />,
    );

    const heading = screen.getByRole('heading', { name: 'Verify your email' });

    onboardingHeadlineClasses.split(' ').forEach((className) => {
      expect(heading).toHaveClass(className);
    });
  });

  it('keeps the original simplified scale for every other surface', () => {
    render(<AuthHeader simplified title="Sign up" />);

    const heading = screen.getByRole('heading', { name: 'Sign up' });

    expect(heading).toHaveClass('typo-title2');
    expect(heading).not.toHaveClass('typo-title1');
  });
});
